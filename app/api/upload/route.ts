import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { toCdn } from '@/lib/image-utils';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'submissions';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Formato não suportado.' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Máximo 15MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const timestamp = Date.now();
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);
    const key = `${folder}/${timestamp}-${safeName}.jpg`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    // toCdn garante o domínio custom e remove qualquer prefixo VARNAME=
    // caso a env var R2_PUBLIC_URL tenha sido configurada incorretamente.
    const publicUrl = toCdn(`${process.env.R2_PUBLIC_URL}/${key}`);
    return NextResponse.json({ url: publicUrl, key });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erro no upload: ' + error.message }, { status: 500 });
  }
}
