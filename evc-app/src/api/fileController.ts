
import { getRepository } from 'typeorm';
import { File } from '../entity/File';
import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { assertRole } from '../utils/assert';
import { getUtcNow } from '../utils/getUtcNow';
import { getS3ObjectStream, uploadToS3 } from '../utils/uploadToS3';
import { v4 as uuidv4 } from 'uuid';

export const downloadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { id } = req.params;
  const { user: { id: userId, role } } = req as any;

  const fileRepo = getRepository(File);
  const query = ['admin', 'agent'].includes(role) ? { id } : { id, createdBy: userId };
  const file = await fileRepo.findOne(query);
  assert(file, 404);

  const { fileName, mime } = file;

  const stream = getS3ObjectStream(id, fileName);
  res.setHeader('Content-type', mime);
  res.setHeader('Content-disposition', 'attachment; filename=' + fileName);

  res.set('Cache-Control', `public, max-age=31536000`);
  stream.pipe(res);
});

export const getFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { id } = req.params;
  const repo = getRepository(File);
  const file = await repo.findOne(id);
  assert(file, 404);

  res.set('Cache-Control', `public, max-age=31536000`);
  res.json(file);
});

export const searchFileList = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { ids } = req.body;
  const files = await getRepository(File)
    .createQueryBuilder()
    .where('id IN (:...ids)', { ids })
    .getMany();
  res.json(files);
});

export const uploadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'member', 'free');
  const { user } = req as any;
  const { file } = (req as any).files;
  assert(file, 404, 'No file to upload');
  const { name, data, mimetype, md5 } = file;

  const id = uuidv4();
  const location = await uploadToS3(id, name, data);

  const entity: File = {
    id,
    createdBy: user.id,
    fileName: name,
    mime: mimetype,
    location,
    md5,
  };

  const repo = getRepository(File);
  await repo.insert(entity);

  res.json(entity);
});