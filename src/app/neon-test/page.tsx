import { neon } from '@neondatabase/serverless';

export default function NeonTestPage() {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold">Neon Integration Test</h1>
        <form action={create} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="write a comment" 
              name="comment" 
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
