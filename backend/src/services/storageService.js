const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const uploadsRoot = path.join(process.cwd(), "uploads");

const useS3 = process.env.USE_S3 === "true";
const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

const s3Client = useS3 ? new S3Client({ region }) : null;

const toSafeFileName = (originalName) => {
  const ext = path.extname(originalName || "").toLowerCase();
  const base = path.basename(originalName || "file", ext).replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 40);
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${base}${ext}`;
};

const ensureLocalFolder = async (folder) => {
  await fsp.mkdir(path.join(uploadsRoot, folder), { recursive: true });
};

const uploadFile = async (file, folder) => {
  if (!file) return null;

  const fileName = toSafeFileName(file.originalname);
  const objectKey = `${folder}/${fileName}`;

  if (useS3) {
    if (!bucket || !region) {
      throw new Error("AWS_S3_BUCKET and AWS_REGION are required when USE_S3=true");
    }

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return {
      key: objectKey,
      url: `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`
    };
  }

  await ensureLocalFolder(folder);
  const output = path.join(uploadsRoot, objectKey);
  await fsp.writeFile(output, file.buffer);

  return {
    key: objectKey,
    url: `/uploads/${objectKey}`
  };
};

const deleteFileByUrl = async (url) => {
  if (!url) return;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (!useS3 || !bucket) return;
    const urlObj = new URL(url);
    const key = decodeURIComponent(urlObj.pathname.replace(/^\//, ""));
    if (!key) return;

    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return;
  }

  if (!url.startsWith("/uploads/")) return;
  const localPath = path.join(process.cwd(), url.replace(/^\//, ""));
  if (fs.existsSync(localPath)) {
    await fsp.unlink(localPath);
  }
};

module.exports = {
  uploadFile,
  deleteFileByUrl
};
