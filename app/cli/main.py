import click
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import SessionLocal, engine
from app.models.models import KnowledgeItem, Base
from app.services.vector_indexing_service import VectorIndexingService
from app.core.logging import logger
from tqdm import tqdm
import sys


def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


@click.group()
def cli():
    """Vector Indexing CLI"""
    pass


@cli.command()
@click.option('--force', is_flag=True, help='Force rebuild all indices')
def rebuild_indices(force):
    """Rebuild all vector indices"""
    try:
        db = SessionLocal()
        vector_service = VectorIndexingService(db)
        
        # Get all active knowledge items
        knowledge_items = db.query(KnowledgeItem).filter(KnowledgeItem.is_active == True).all()
        
        if not knowledge_items:
            click.echo("No knowledge items found to process.")
            return
        
        click.echo(f"Found {len(knowledge_items)} knowledge items to process.")
        
        if not force:
            if not click.confirm('This will rebuild all vector indices. Continue?'):
                click.echo("Operation cancelled.")
                return
        
        # Process each knowledge item
        success_count = 0
        error_count = 0
        
        with tqdm(knowledge_items, desc="Processing knowledge items") as pbar:
            for item in pbar:
                try:
                    vector_service.process_knowledge_item(item.id)
                    success_count += 1
                    pbar.set_postfix({"success": success_count, "errors": error_count})
                except Exception as e:
                    error_count += 1
                    logger.error(f"Error processing knowledge item {item.id}: {e}")
                    pbar.set_postfix({"success": success_count, "errors": error_count})
        
        click.echo(f"\nRebuild completed: {success_count} successful, {error_count} errors")
        
        # Show final stats
        stats = vector_service.get_embedding_stats()
        click.echo(f"Final stats: {stats}")
        
    except Exception as e:
        logger.error(f"Error rebuilding indices: {e}")
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        db.close()


@cli.command()
@click.option('--item-ids', help='Comma-separated list of knowledge item IDs to process')
@click.option('--all-items', is_flag=True, help='Process all knowledge items')
def process_items(item_ids, all_items):
    """Process specific knowledge items for vector indexing"""
    try:
        db = SessionLocal()
        vector_service = VectorIndexingService(db)
        
        if all_items:
            knowledge_items = db.query(KnowledgeItem).filter(KnowledgeItem.is_active == True).all()
        elif item_ids:
            try:
                ids = [UUID(id.strip()) for id in item_ids.split(',')]
                knowledge_items = db.query(KnowledgeItem).filter(
                    KnowledgeItem.id.in_(ids),
                    KnowledgeItem.is_active == True
                ).all()
            except ValueError as e:
                click.echo(f"Invalid UUID format: {e}", err=True)
                sys.exit(1)
        else:
            click.echo("Either --item-ids or --all-items must be specified.", err=True)
            sys.exit(1)
        
        if not knowledge_items:
            click.echo("No knowledge items found to process.")
            return
        
        click.echo(f"Processing {len(knowledge_items)} knowledge items...")
        
        success_count = 0
        error_count = 0
        
        for item in tqdm(knowledge_items, desc="Processing items"):
            try:
                vector_service.process_knowledge_item(item.id)
                success_count += 1
                click.echo(f"✓ Processed: {item.id}")
            except Exception as e:
                error_count += 1
                logger.error(f"Error processing knowledge item {item.id}: {e}")
                click.echo(f"✗ Error processing {item.id}: {e}")
        
        click.echo(f"\nProcessing completed: {success_count} successful, {error_count} errors")
        
    except Exception as e:
        logger.error(f"Error processing items: {e}")
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        db.close()


@cli.command()
def stats():
    """Show vector indexing statistics"""
    try:
        db = SessionLocal()
        vector_service = VectorIndexingService(db)
        
        stats = vector_service.get_embedding_stats()
        
        click.echo("Vector Indexing Statistics:")
        click.echo(f"  Total embedding records: {stats.get('total_embedding_records', 0)}")
        click.echo(f"  Qdrant collection points: {stats.get('qdrant_collection_info', 0)}")
        click.echo(f"  Embedding model: {stats.get('embedding_model', 'Unknown')}")
        click.echo(f"  Embedding dimension: {stats.get('embedding_dimension', 'Unknown')}")
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)
    finally:
        db.close()


@cli.command()
def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        click.echo("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        click.echo(f"Error: {e}", err=True)
        sys.exit(1)


if __name__ == '__main__':
    cli()