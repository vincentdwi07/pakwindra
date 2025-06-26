import { supabaseClient } from '@/lib/supabase'

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    // Validasi file
    if (!file) {
      return new Response(JSON.stringify({
        error: 'No file provided',
        success: false
      }), { status: 400 });
    }

    if (!file.type.includes('pdf')) {
      return new Response(JSON.stringify({
        error: "Invalid file type. Only PDF files are allowed",
        success: false
      }), { status: 400 });
    }

    // Convert file ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    console.log('Uploading file:', fileName);

    // Upload ke Supabase Storage menggunakan service role key
    const { data, error } = await supabaseClient.storage
      .from('instructionfiles') 
      .upload(`instructionFiles/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return new Response(JSON.stringify({
        error: `Upload failed: ${error.message}`,
        success: false
      }), { status: 500 });
    }

    // Ambil public URL file
    const { data: publicUrlData } = supabaseClient.storage
      .from('instructionfiles')
      .getPublicUrl(`instructionFiles/${fileName}`);

    return new Response(JSON.stringify({
      success: true,
      fileUrl: publicUrlData.publicUrl,
      filePath: `instructionFiles/${fileName}`,
      fileName: fileName
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'File upload failed',
      details: error.message,
      success: false
    }), { status: 500 });
  }
}