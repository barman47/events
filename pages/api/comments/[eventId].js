import { connectDatabase, getAllDocuments, insertDocument } from '../../../helpers/db-util';

async function handler (req, res) {
    const { eventId } = req.query;

    let client;
    try {
        client = await connectDatabase();
    } catch (err) {
        return res.status(500).json({ message: 'Connecting to the database failed!' });
    }

    if (req.method === 'POST') {
        // add server-side validation
        const { email, name, text } = req.body;

        if (!email.includes('@' || !name || name.trim() === '') || !text || text.trim() === '') {
            client.close();
            return res.status(422).json({ message: 'Invalid input' });
        }
        
        const newComment = {
            email,
            name,
            text,
            eventId
        };

        let result;

        try {
            result = await insertDocument(client, 'comments', newComment);
            newComment._id = result.insertedId
            res.status(201).json({ message: 'Added comment', comment: newComment });
        } catch (err) {
            return res.status(500).json({ message: 'Inserting comment failed' });
        }
    }

    if (req.method === 'GET') {
        try {
            const comments = await getAllDocuments(client, 'comments', { _id: -1 });
            res.status(200).json({ comments })
        } catch (err) {
            res.status(500).json({ message: 'Getting comments failed.' });
        }

    }
    client.close();
}

export default handler;