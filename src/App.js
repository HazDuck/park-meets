//johnstone street bath royal cresent bath

import React, { useState, useEffect } from 'react';
import axios from 'axios'

export const App = () => {
  const [ address1, setAddress1 ] = useState('')
  const [ address2, setAddress2 ] = useState('')
  const [ radius, setRadius ] = useState(200)
  const [ coordinates, setCoordinates ] = useState({})
  const [ centralLocation, setCentralLocation ] = useState({})
  const [ loading, setLoading ] = useState(false)
  const [ parks, setParks ] = useState({})

  const getCoordinates = async () => {
    setLoading(true)
    let apiResponse
    try {
      apiResponse = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=”${address1}”&destination=”${address2}”&key=${process.env.REACT_APP_API_KEY}`)
      setCoordinates({data: apiResponse.data, status: apiResponse.data.status})
      setLoading(false)
    } 
    catch(error) {
      setCoordinates({data: null, status: apiResponse && apiResponse.data && apiResponse.data.status ? apiResponse.data.status : 'fail'})
    } 
  }

  const calculateCentralLocation = () => {
      setCentralLocation({
        lat:(coordinates.data.routes[0].legs[0].end_location.lat + coordinates.data.routes[0].legs[0].start_location.lat)/2,
        lng:(coordinates.data.routes[0].legs[0].end_location.lng + coordinates.data.routes[0].legs[0].start_location.lng)/2
      })
      if (centralLocation.lat !== undefined || centralLocation.lng !== undefined ) {
        getParks()
      }
  }

  const getParks = async () => {
    setLoading(true)
    let apiResponse
    try {
      apiResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centralLocation.lat},${centralLocation.lng}&radius=${radius}&type=park&key=${process.env.REACT_APP_API_KEY}`)
      setParks({data: apiResponse.data, status: apiResponse && apiResponse.data && apiResponse.data.status ? apiResponse.data.status : 'fail'})
      setLoading(false)
    } 
    catch(error) {
      setCoordinates({data: null, status: apiResponse && apiResponse.data && apiResponse.data.status ? apiResponse.data.status : 'fail'})
    }
  }

  useEffect(() => {
    if (coordinates.status !== "OK") return
    calculateCentralLocation()
  }, [coordinates])

  return (
    <div className="inputs-container">
      <form>
        <input
          type="text"
          value={address1}
          onChange={e => setAddress1(e.target.value)}
          placeholder="Address 1"
        ></input>
        <input
          type="text"
          value={radius}
          onChange={e => setRadius(e.target.value)}
          placeholder="Search Radius (m)"
        ></input>
        <input
          type="text"
          value={address2}
          onChange={e => setAddress2(e.target.value)}
          placeholder="Address 2"
        ></input>
        <button
        type="button"
        onClick={() => getCoordinates()}
        onKeyDown={() => getCoordinates()}
        >GO</button>
      </form>
      <div>
        {coordinates.status === "ZERO_RESULTS" && (
          <p>Please refine your search terms...</p>
        )}
        {loading ? <p>'loading...'</p> : parks.data && parks.data.results &&
        <ul>
          {parks.data.results.map(park => 
            <li key={park.id}>
              {park.name} 
              { park.vicinity &&  
              `, ${park.vicinity}`
              }
            </li>
          )}
        </ul>
        }
      </div>

    </div>
  );
}