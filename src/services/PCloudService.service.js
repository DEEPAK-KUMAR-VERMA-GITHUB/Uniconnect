import pcloud from "pcloud-sdk-js";
import ErrorHandler from "../utils/ErrorHandler.js";

export class PCloudService {
  static client;
  constructor() {
    if (!process.env.PCLOUD_ACCESS_TOKEN) {
      throw new ErrorHandler(500, "pCloud access token not found");
    }

    this.client = pcloud.createClient(process.env.PCLOUD_ACCESS_TOKEN);
  }

  async uploadResource(file, resourceType) {
    try {
      // Create folder based on resource type if it doesn't exist
      const folderName = `uniconnect/${resourceType}`;
      let folderId;

      try {
        const folder = await this.client.createfolder(folderName);
        folderId = folder.metadata.folderid;
      } catch (err) {
        // Folder likely exists, get the folder ID
        const folders = await this.client.listfolder("/uniconnect");
        folderId = folders.contents.find(
          (f) => f.name === resourceType
        )?.folderid;

        if (!folderId) {
          throw new ErrorHandler(500, "Could not create/find folder");
        }
      }

      // Upload file to the folder
      const uploadResult = await this.client.upload(file.buffer, {
        folderId,
        name: file.filename,
      });

      // Get public link
      const linkResult = await this.client.getfilelink(uploadResult.fileId);

      return {
        fileUrl: linkResult.link,
        fileId: uploadResult.fileId,
      };
    } catch (error) {
      throw new ErrorHandler(
        500,
        error.message || "Error uploading file to pCloud"
      );
    }
  }

  async deleteResource(fileId) {
    try {
      await this.client.deletefile(fileId);
    } catch (error) {
      throw new ErrorHandler(500, "Error deleting file from pCloud");
    }
  }

  async downloadResource(fileId) {
    try {
      // Get file metadata to check if it exists
      const fileInfo = await this.client.stat(fileId);

      if (!fileInfo || !fileInfo.metadata) {
        throw new ErrorHandler(404, "File not found");
      }

      // Get download link for the file
      const downloadResult = await this.client.getfilelink(fileId);

      if (!downloadResult || !downloadResult.link) {
        throw new ErrorHandler(500, "Could not generate download link");
      }

      return {
        downloadUrl: downloadResult.link,
        filename: fileInfo.metadata.name,
      };
    } catch (error) {
      throw new ErrorHandler(
        error.code === 404 ? 404 : 500,
        error.message || "Error downloading file from pCloud"
      );
    }
  }
}
