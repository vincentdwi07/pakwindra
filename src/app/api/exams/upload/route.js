import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req){
    try{
        const formData = await req.formData();
        const file = formData.get('file');

        //Validasi apakah ada filenya
        if (!file) {
            return new Response(JSON.stringify({
                error: 'No file provided',
                success: false
            }), { status: 400 });  
        }

        // Validasi tipe file (.pdf)
        if (!file.type.includes('pdf')) {
            return new Response(JSON.stringify({
                error: "Invalid file type. Only PDF files are allowed",
                success: false
            }), { status: 400 });  
        }

        //Membuat direktori baru jika belum ada
        const uploadDir = join(process.cwd(), 'public', 'instructionFiles');
        try{
            await mkdir(uploadDir, { recursive: true });
        }catch(err){
            if (err.code !== 'EEXIST') throw err;
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);  
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = join(uploadDir, filename);

        await writeFile(filePath, buffer);

        return new Response(JSON.stringify({
            success: true,
            filePath: `/instructionFiles/${filename}`
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }   
        })
    }catch (error){
        console.error('Error uploading file:', error);
        return new Response(JSON.stringify({
            error: 'File upload failed',
            success: false,
        }), { status: 500 });
    }
}