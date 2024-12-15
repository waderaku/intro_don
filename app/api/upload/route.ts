import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { supabase } from '@/lib/supabase';
import { validateAudioFile } from '@/lib/utils/upload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const roomId = formData.get('roomId') as string | undefined;

    if (!file || !title || !artist) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    try {
      validateAudioFile(file);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${Date.now()}-${sanitizedFileName}`;

    try {
      // 1. S3にファイルをアップロード
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type,
          ContentDisposition: 'inline',
          CacheControl: 'public, max-age=31536000',
        })
      );

      // 2. S3のURLを生成
      const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // 3. Supabaseに曲情報を保存
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert([
          {
            title,
            artist,
            audio_url: audioUrl,
          },
        ])
        .select()
        .single();

      if (songError) {
        throw songError;
      }

      return NextResponse.json({ 
        audioUrl,
        song: songData
      });
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: '予期せぬエラーが発生しました' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};