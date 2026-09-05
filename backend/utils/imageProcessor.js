const fs = require('fs');
const path = require('path');
const os = require('os');

async function compressImage(buffer) {
  return new Promise((resolve, reject) => {
    try {
      // For now, return the buffer as base64 data URL
      // In production, use a proper image compression library like sharp
      const dataUrl = 'data:image/jpeg;base64,' + buffer.toString('base64');
      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = compressImage;
