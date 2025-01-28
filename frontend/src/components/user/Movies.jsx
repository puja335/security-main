import axios from "axios"
import { Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { baseUrl } from "../../baseUrl/baseUrl"
import { MovieSkeleton } from "../../ui/Skeletons"

const Movie = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [nowPlayingDisplayCount, setNowPlayingDisplayCount] = useState(4)
  const [upcomingDisplayCount, setUpcomingDisplayCount] = useState(4)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/user/movies`, {
          withCredentials: true,
        })
        const currentDate = new Date()

        const nowPlaying = response.data.filter(
          (movie) => new Date(movie.releaseDate) <= currentDate
        )
        const upcoming = response.data.filter(
          (movie) => new Date(movie.releaseDate) > currentDate
        )

        setNowPlayingMovies(nowPlaying)
        setUpcomingMovies(upcoming)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filterMovies = (movies) => {
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredNowPlayingMovies = filterMovies(nowPlayingMovies)
  const filteredUpcomingMovies = filterMovies(upcomingMovies)

  const renderSkeletons = (count) => {
    return Array.from({ length: count }).map((_, index) => (
      <MovieSkeleton key={index} />
    ))
  }

  const handleNowPlayingLoadMore = () => {
    setNowPlayingDisplayCount((prevCount) => prevCount + 4)
  }

  const handleUpcomingLoadMore = () => {
    setUpcomingDisplayCount((prevCount) => prevCount + 4)
  }

  const isMobile = window.innerWidth <= 640

  return (
    <div className='container min-h-screen h-full pt-20 mx-auto px-4'>
      {/* Search Section */}
      <div className='mb-8 max-w-2xl mx-auto'>
        <div
          className={`relative transition-all duration-300 ${
            isSearchFocused ? "scale-105" : ""
          }`}
        >
          <div className='relative'>
            <input
              type='text'
              placeholder='Search movies by title, language, or genre...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className='w-full px-4 py-3 pl-12 rounded-lg bg-base-200 border-2 border-transparent focus:border-primary focus:outline-none transition-all duration-300'
            />
            <Search
              className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={20}
            />
          </div>
        </div>
      </div>

      {/* Now Showing Section */}
      <h1 className='text-3xl lg:text-4xl font-bold mb-6 text-center'>
        Now Showing
      </h1>
      <div className='flex justify-center'>
        <div className='flex gap-4 overflow-x-auto flex-nowrap p-4 animate-fade-in sm:grid sm:grid-cols-2 lg:grid-cols-4'>
          {loading ? (
            renderSkeletons(nowPlayingDisplayCount)
          ) : filteredNowPlayingMovies.length === 0 ? (
            <div className='col-span-full text-center py-8 text-gray-500'>
              No movies found matching your search
            </div>
          ) : (
            filteredNowPlayingMovies
              .slice(
                0,
                isMobile
                  ? filteredNowPlayingMovies.length
                  : nowPlayingDisplayCount
              )
              .map((movie, index) => (
                <Link
                  key={index}
                  to={`/movie/${movie._id}`}
                  className='card w-72 bg-base-200 flex-shrink-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
                >
                  <figure>
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className='w-full h-72 object-fill'
                    />
                  </figure>
                  <div className='card-body p-4 flex flex-col justify-between'>
                    <h2 className='card-title mb-2'>{movie.title}</h2>
                    <div className='flex justify-between'>
                      <p className='text-left'>{movie.language}</p>
                      <p className='text-right'>{movie.genre}</p>
                    </div>
                  </div>
                </Link>
              ))
          )}
        </div>
      </div>
      {!loading &&
        filteredNowPlayingMovies.length > nowPlayingDisplayCount &&
        !isMobile && (
          <div className='flex justify-center mt-4'>
            <button
              onClick={handleNowPlayingLoadMore}
              className='btn btn-outline btn-primary hover:scale-105 transition-transform'
            >
              Load More
            </button>
          </div>
        )}

      {/* Upcoming Movies Section */}
      {upcomingMovies.length > 0 && (
        <>
          <h1 className='text-3xl lg:text-4xl font-bold mb-6 text-center mt-10'>
            Upcoming Release
          </h1>
          <div className='flex justify-center'>
            <div className='flex gap-4 overflow-x-auto flex-nowrap p-4 animate-fade-in sm:grid sm:grid-cols-2 lg:grid-cols-4'>
              {loading ? (
                renderSkeletons(upcomingDisplayCount)
              ) : filteredUpcomingMovies.length === 0 ? (
                <div className='col-span-full text-center py-8 text-gray-500'>
                  No upcoming movies found matching your search
                </div>
              ) : (
                filteredUpcomingMovies
                  .slice(
                    0,
                    isMobile
                      ? filteredUpcomingMovies.length
                      : upcomingDisplayCount
                  )
                  .map((movie, index) => (
                    <Link
                      key={index}
                      to={`/movie/${movie._id}`}
                      className='card w-72 bg-base-200 flex-shrink-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
                    >
                      <figure>
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className='w-full h-72 object-fill'
                        />
                      </figure>
                      <div className='card-body p-4 flex flex-col justify-between'>
                        <h2 className='card-title mb-2'>{movie.title}</h2>
                        <div className='flex justify-between'>
                          <p className='text-left'>{movie.language}</p>
                          <p className='text-right'>{movie.genre}</p>
                        </div>
                      </div>
                    </Link>
                  ))
              )}
            </div>
          </div>
          {!loading &&
            filteredUpcomingMovies.length > upcomingDisplayCount &&
            !isMobile && (
              <div className='flex justify-center mt-4 pb-4'>
                <button
                  onClick={handleUpcomingLoadMore}
                  className='btn btn-outline btn-primary hover:scale-105 transition-transform'
                >
                  Load More
                </button>
              </div>
            )}
        </>
      )}
    </div>
  )
}

export default Movie
