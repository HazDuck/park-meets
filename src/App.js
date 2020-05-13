import React, { useState } from 'react';
import axios from 'axios'

export const App = () => {
  const [ address1, setAddress1 ] = useState('')
  const [ address2, setAddress2 ] = useState('')
  const [ radius, setRadius ] = useState(200)
  const [ loading, setLoading ] = useState(false)
  const [ parks, setParks ] = useState({})
  const [ errorMessage, setErrorMessage ] = useState('')

  const getCoordinates = async () => {
    setLoading(true)
    let apiResponse
    try {
      await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=”${address1}”&destination=”${address2}”&key=${process.env.REACT_APP_API_KEY}`)
      .then(data => {
        apiResponse = {data: data.data, status: data.data.status}
        calculateCentralLocation(apiResponse)
      })
    } 
    catch(error) {
      setErrorMessage('404')
      setLoading(false)
    } 
  }

  const calculateCentralLocation = (apiResponse) => {
    if (apiResponse.status !== "OK") {
      setErrorMessage(apiResponse.status)
      setLoading(false)
    }

    if (apiResponse && apiResponse.data && apiResponse.data.routes[0] && apiResponse.data.routes[0].legs[0]) {
      let centralLocation = {
        lat: (apiResponse.data.routes[0].legs[0].end_location.lat + apiResponse.data.routes[0].legs[0].start_location.lat)/2,
        lng: (apiResponse.data.routes[0].legs[0].end_location.lng + apiResponse.data.routes[0].legs[0].start_location.lng)/2
      }
      if (centralLocation.lat !== undefined && centralLocation.lng !== undefined ) {
        getParks(centralLocation)
      }
    }
  }

  const getParks = async (centralLocation) => {
    try {
      await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centralLocation.lat},${centralLocation.lng}&radius=${radius}&type=park&key=${process.env.REACT_APP_API_KEY}`)
      .then(apiResponse => {
        if (apiResponse.data.status === "INVALID_REQUEST") {
          setErrorMessage(apiResponse.data.status)
          setLoading(false)
        } else {
          setParks({data: apiResponse.data, status: apiResponse && apiResponse.data && apiResponse.data.status ? apiResponse.data.status : 'fail'})
          setLoading(false)
        }
      }) 
    } 
    catch(error) {
      console.log(error)
    }
  }

  return (
    <div className="app-container">
      <div className="image phone"><div className="inner"><img src="/images/screen.png" alt="screen" /></div></div>
      <div className="title-container">
        <div className="title-container-inner">
          <h1>ParkMeets</h1>
          <p>Give ParkMeets two addesses and we will find you parks and outdoor spaces in the middle to meet at</p>
        </div>
      </div>
      <div className="inputs-container">
        <label
        for="address1"
        >First address:</label>
        <input
          id="address1"
          type="text"
          value={address1}
          onChange={e => setAddress1(e.target.value)}
        ></input>
        <label
        for="radius"
        >Radius from center(m):</label>
        <input
          id="radius"
          type="text"
          value={radius}
          onChange={e => setRadius(e.target.value)}
        ></input>
        <label
        for="address2"
        >Second address:</label>
        <input
          id="address2"
          type="text"
          value={address2}
          onChange={e => setAddress2(e.target.value)}
        ></input>
        <button
        type="button"
        onClick={() => {
          getCoordinates()
          setErrorMessage('')
        }}
        onKeyDown={() => {
          getCoordinates()
          setErrorMessage('')
        }}
        >Let's meet</button>
        <div>
          {errorMessage === "ZERO_RESULTS" ? 
          <p>Please refine your search terms...</p> : errorMessage === "404" ?
          <p>Something went wrong..sorry</p> : errorMessage === "NOT_FOUND" ?
          <p>Please refine your search terms...</p> : errorMessage === "INVALID_REQUEST" ? 
          <p>Something went wrong...sorry</p> : ''}

          {parks.status === "ZERO_RESULTS" && (
            <p>There are no parks within {radius}m of the mid-point</p>
          )}

          {loading ? <p>'loading...'</p> : parks.data && parks.data.results &&
          <ul>
            {parks.data.results.map(park => 
              <li key={park.id}>
                <a href={`https://www.google.com/maps/place/?q=place_id:${park.place_id}`} target="_blank">{park.name}</a>
                { park.vicinity &&  
                `, ${park.vicinity}`
                }
              </li>
            )}
          </ul>
          }
        </div>
      </div>
    </div>
  );
}