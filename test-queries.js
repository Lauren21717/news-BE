const db = require('./db/connection');
const fs = require('fs');

const queryDatabase = async () => {
    try {
        const resultsFolder = 'query-results';
        if (!fs.existsSync(resultsFolder)) {
            fs.mkdirSync(resultsFolder);
        }

        // 1. Get all of the users
        const { rows: users } = await db.query(`SELECT * FROM users;`);
        fs.writeFileSync('query-results/all-users.txt', JSON.stringify(users, null, 2));
        console.log(`✅ Saved ${users.length} users to query-results/all-users.txt`);

        // 2. Get all articles where topic is coding
        const { rows: codingArticles } = await db.query(
            `SELECT *
             FROM articles 
             WHERE topic = $1;`,
            ['coding']
        );
        fs.writeFileSync('query-results/coding-articles.txt', JSON.stringify(codingArticles, null, 2));
        console.log(`✅ Saved ${codingArticles.length} coding articles to query-results/coding-articles.txt`);

        // 3. Get all comments where votes are less than zero
        const { rows: negativeComments } = await db.query(`SELECT * FROM comments WHERE votes < 0;`);
        fs.writeFileSync('query-results/negative-comments.txt', JSON.stringify(negativeComments, null, 2));
        console.log(`✅ Saved ${negativeComments.length} negative comments to query-results/negative-comments.txt`);

        // 4. Get all of the topics
        const { rows: topics } = await db.query(`SELECT * FROM topics;`);
        fs.writeFileSync('query-results/all-topics.txt', JSON.stringify(topics, null, 2));
        console.log(`✅ Saved ${topics.length} topics to query-results/all-topics.txt`);

        // 5. Get all articles by user grumpy19
        const { rows: grumpyArticles } = await db.query(
            `SELECT * FROM articles
            WHERE author = $1`,
            ['grumpy19']
        );
        fs.writeFileSync('query-results/grumpy19-articles.txt', JSON.stringify(grumpyArticles, null, 2))
        console.log(`✅ Saved ${grumpyArticles.length} articles by grumpy19 to query-results/grumpy19-articles.txt`);

        // 6. Get all comments that have more than 10 votes
        const { rows: popularComments } = await db.query(`SELECT * FROM comments WHERE votes > 10;`)
        fs.writeFileSync('query-results/popular-comments.txt', JSON.stringify(popularComments, null, 2));
        console.log(`✅ Saved ${popularComments.length} popular comments to query-results/popular-comments.txt`);
        
    } catch (error) {
        console.error('❌ Error running queries:', error);
    } finally {
        await db.end();
    }
};

queryDatabase();
