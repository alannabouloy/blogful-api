const { expect } = require('chai')
const { default: expectCt } = require('helmet/dist/middlewares/expect-ct')
const knex = require('knex')
const supertest = require('supertest')
const { makeArticlesArray } = require('./articles.fixtures')
const app = require('../src/app')

describe.only('Article Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('blogful_articles').truncate())

    afterEach('delete articles', () => db('blogful_articles').truncate())

    describe(`GET /articles`, () => {
        context('Given there are articles in the database', () => {
        
            const testArticles = makeArticlesArray()
    
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            })
    
            it('GET /articles should respond with all articles in blogful_articles', () => {
                return supertest(app)
                    .get('/articles')
                    .expect(200, testArticles)
                    //TODO: add more assertions about the body
            })
        })
        context(`Given no articles`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/articles')
                    .expect(200, [])
            })
        })
    })
    
    describe('GET /articles/:article_id', () => {
        context('Given there are articles in the database', () => {
        
            const testArticles = makeArticlesArray()
    
            beforeEach('insert articles', () => {
                return db
                    .into('blogful_articles')
                    .insert(testArticles)
            })

            it('GET /articles/:article_id responds with 200 and the specified article', () => {
                const articleId = 2
                const expectedArticle = testArticles[articleId - 1]
                return supertest(app)
                    .get(`/articles/${articleId}`)
                    .expect(200, expectedArticle)
            })
        })
        context(`Given no articles`, () => {
            it(`responds with 404`, () => {
                const articleId = 123456
                return supertest(app)
                    .get(`/articles/${articleId}`)
                    .expect(404, {error: {message: `Article doesn't exist`}})
            })
        }) 
    })
         
})