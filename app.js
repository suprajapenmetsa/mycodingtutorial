const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//API1

app.get('/movies/', async (request, response) => {
  const gettingMoviesQuery = `
  SELECT movie_name FROM movie;`
  const moviesArray = await db.all(gettingMoviesQuery)

  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

//API2
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const postMovieQuery = `
  INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES
  (
    ${directorId},
    "${movieName}",
    "${leadActor}"
  )`
  await db.run(postMovieQuery)

  response.send('Movie Successfully Added')
})

//API3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const gettingMovieQuery = `
  SELECT * FROM movie 
  WHERE 
  movie_id=${movieId};`

  const mymovie = await db.get(gettingMovieQuery)
  response.send(convertMovieObjectToResponseObject(mymovie))
})

//API4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const putmovieDetails = `
  UPDATE movie SET
  director_id=${directorId},
  movie_name="${movieName}",
  lead_actor="${leadActor}"
  WHERE
  movie_id=${movieId};

  `
  await db.run(putmovieDetails)

  response.send('Movie Details Updated')
})
