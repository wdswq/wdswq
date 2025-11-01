// Example usage of the File Upload API
// This demonstrates how to upload a file in chunks using the API

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileUploader {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  async uploadFile(filePath, options = {}) {
    try {
      const fileStats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const fileSize = fileStats.size;
      
      // Calculate file hash for deduplication
      const fileBuffer = fs.readFileSync(filePath);
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      console.log(`Uploading ${fileName} (${fileSize} bytes, hash: ${fileHash})`);

      // Step 1: Initiate upload
      const initiateResponse = await this.initiateUpload({
        fileName,
        totalSize: fileSize,
        fileHash,
        mimeType: options.mimeType || 'application/octet-stream',
        chunkSize: options.chunkSize || 1024 * 1024, // 1MB chunks
        category: options.category,
        tags: options.tags,
      });

      if (initiateResponse.existingFileAsset) {
        console.log('File already exists, deduplication applied');
        return initiateResponse.existingFileAsset;
      }

      const { uploadJobId, chunkSize, totalChunks } = initiateResponse;
      console.log(`Upload initiated: ${uploadJobId}, ${totalChunks} chunks of ${chunkSize} bytes`);

      // Step 2: Upload chunks
      const fileBufferForChunks = fs.readFileSync(filePath);
      for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
        const start = chunkNumber * chunkSize;
        const end = Math.min(start + chunkSize, fileSize);
        const chunkData = fileBufferForChunks.slice(start, end);
        
        // Calculate chunk hash for integrity verification
        const chunkHash = crypto.createHash('md5').update(chunkData).digest('hex');
        
        console.log(`Uploading chunk ${chunkNumber + 1}/${totalChunks} (${chunkData.length} bytes)`);

        await this.uploadChunk(uploadJobId, chunkNumber, chunkData, chunkHash);
      }

      console.log('File upload completed successfully!');
      
      // Step 3: Get file details
      const uploadJob = await this.getUploadJob(uploadJobId);
      if (uploadJob.fileAssetId) {
        const fileAsset = await this.getFileAsset(uploadJob.fileAssetId);
        console.log('File asset created:', fileAsset);
        return fileAsset;
      }

    } catch (error) {
      console.error('Upload failed:', error.message);
      throw error;
    }
  }

  async initiateUpload(data) {
    const response = await fetch(`${this.baseUrl}/file-upload/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  }

  async uploadChunk(uploadJobId, chunkNumber, chunkData, chunkHash) {
    const formData = new FormData();
    formData.append('chunk', new Blob([chunkData]));
    formData.append('uploadJobId', uploadJobId);
    formData.append('chunkNumber', chunkNumber.toString());
    formData.append('chunkHash', chunkHash);
    formData.append('isLastChunk', 'false');

    const response = await fetch(`${this.baseUrl}/file-upload/upload-chunk`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  }

  async getUploadJob(uploadJobId) {
    const response = await fetch(`${this.baseUrl}/file-upload/jobs/${uploadJobId}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  }

  async getFileAsset(fileAssetId) {
    const response = await fetch(`${this.baseUrl}/file-upload/files/${fileAssetId}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  }

  async listFiles(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseUrl}/file-upload/files?${queryParams}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  }

  async downloadFile(fileAssetId, outputPath) {
    const response = await fetch(`${this.baseUrl}/file-upload/files/${fileAssetId}/download`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }

    const downloadResponse = await fetch(result.data.downloadUrl);
    const buffer = await downloadResponse.buffer();
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`File downloaded to: ${outputPath}`);
  }
}

// Example usage
async function main() {
  const uploader = new FileUploader();

  try {
    // Example 1: Upload a PDF document
    console.log('=== Uploading PDF Document ===');
    const pdfFile = await uploader.uploadFile('./example-document.pdf', {
      mimeType: 'application/pdf',
      category: 'document',
      tags: ['example', 'document', 'pdf'],
    });
    console.log('PDF uploaded:', pdfFile.id);

    // Example 2: List files
    console.log('\n=== Listing Files ===');
    const files = await uploader.listFiles({
      page: 1,
      limit: 10,
      category: 'document',
    });
    console.log(`Found ${files.total} files:`);
    files.files.forEach(file => {
      console.log(`- ${file.originalName} (${file.size} bytes, ${file.mimeType})`);
    });

    // Example 3: Download a file
    if (files.files.length > 0) {
      console.log('\n=== Downloading File ===');
      await uploader.downloadFile(files.files[0].id, './downloaded-file.pdf');
    }

  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = FileUploader;