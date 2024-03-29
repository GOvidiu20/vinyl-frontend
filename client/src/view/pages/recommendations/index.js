import React, {useEffect, useState} from 'react';
import CustomLayout from "../../components/Layout";
import {Container, Row, Col, Button, Card, Tab, Tabs, Spinner} from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import './recommendation.scss';
import DisplayVinyl from "../../components/showSongs";

export default function Recommendations() {

    const [songs, setSongs] = useState([]);
    const [playlistsArtists, setPlaylistsArtists] = useState([]);
    const [playlistsGenres, setPlaylistsGenres] = useState([]);
    const [topSpotifySongs, setTopSpotifySongs] = useState([])
    const [topSpotifyArtists, setTopSpotifyArtists] = useState([])
    const [spotifySavedAlbums, setSpotifySavedAlbums] = useState([])
    const [userPreference, setUserPreference] = useState("")
    const [sparkRecommendedSongs, setSparkRecommendedSongs] = useState([]);
    const [spotifyRecommendedSongs, setSpotifyRecommendedSongs] = useState([]);
    const [fileRecommendedSongs, setFileRecommendedSongs] = useState([]);
    const [playlistsRecommendedSongs, setPlaylistsRecommendedSongs] = useState([]);
    const [file, setFile] = useState();
    const [loadingButtonText, setLoadingButtonText] = useState(false)
    const [loadingButtonSpotify, setLoadingButtonSpotify] = useState(false)
    const [loadingButtonFile, setLoadingButtonFile] = useState(false)
    const [loadingButtonPlaylists, setLoadingButtonPlaylists] = useState(false)

    useEffect(() => {
        loadSongs();
        loadSpotifySavedAlbums();
        loadTopSpotifyArtists();
        loadTopSpotifySongs();
        // verifyUserTokenAvailability();
    }, []);

    useEffect(() => {
        loadPlaylists();
    }, [songs]);

    const loadSongs = async () => {
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/songs', {
                headers: new Headers({
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }),
            })
                .then(response => response.json())
                .then(data =>{
                    let songsData = [];
                    data.forEach((song) => {
                        songsData[song.id] = {
                            'artist' : song.creator,
                            'genre' : song.genre,
                        }
                    })
                    setSongs(songsData)
                })
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    const loadPlaylists = async () => {
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/playlists/user/' + localStorage.getItem('userId'), {
                headers: new Headers({
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }),
            })
                .then(response => response.json())
                .then(data => {
                    let artists = [];
                    let genres = []
                    data.forEach((playlist) => {
                        playlist.songIds.forEach((songId) => {
                            artists.push(songs[songId]['artist'])
                            genres.push(songs[songId]['genre'])
                        })
                    })

                    setPlaylistsArtists(artists);
                    setPlaylistsGenres(genres)
                })
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    async function loadTopSpotifySongs(){
        try {
                await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/spotify/userTopSongs?userId=' + localStorage.getItem('userId'), {
                    headers: new Headers({
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    }),
                })
                    .then(response => response.json())
                    .then(async data => {
                        if (data.length !== 0) {
                            let songs = [];
                            data.forEach(song => {
                                let artists = "";
                                song.artists.map((artist, index) => (
                                    artists += index === song.artists.length - 1 ? artist.name : artist.name + ', '
                                ))
                                songs.push({
                                    'artists' : artists,
                                    'name' : song.name,
                                    'spotifyUrl': song.externalUrls.externalUrls.spotify,
                                    'url': song.album.images[1].url,
                                })
                            })
                            setTopSpotifySongs(songs);
                        } else {
                            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/songs/spotify/' + localStorage.getItem('userId'), {
                                headers: new Headers({
                                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                                }),
                            }).then(response => response.json())
                              .then(data => setTopSpotifySongs(data))
                        }
                    })
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    async function loadTopSpotifyArtists(){
        try {
                await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/spotify/userTopArtists?userId=' + localStorage.getItem('userId'), {
                    headers: new Headers({
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    }),
                })
                    .then(response => response.json())
                    .then(async data => {
                        if (data.length !== 0) {
                            let artists = [];
                            data.forEach(artist => {
                                let genres = "";
                                artist.genres.map((genre, index) => (
                                    genres += index === artist.genres.length - 1 ? genres : genres + ', '
                                ))
                                artists.push({
                                    'url' : artist.images[1].url,
                                    'urlSpotify' : artist.externalUrls.externalUrls.spotify,
                                    'genres' : genres,
                                    'name' : artist.name
                                })
                            })
                            setTopSpotifyArtists(artists);
                        } else {
                            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/artists/spotify/' + localStorage.getItem('userId'), {
                                headers: new Headers({
                                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                                }),
                            }).then(response => response.json())
                              .then(data => {
                                  setTopSpotifyArtists(data);
                              })
                        }
                    })
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    async function loadSpotifySavedAlbums(){
        try {
                await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/spotify/userSavedAlbum?userId=' + localStorage.getItem('userId'), {
                    headers: new Headers({
                        'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if(data.length !== 0) {
                            setSpotifySavedAlbums(data);
                            localStorage.setItem("albums", JSON.stringify(data));
                        }
                        else
                            setSpotifySavedAlbums(localStorage.getItem('albums'));
                    })
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    async function verifyUserTokenAvailability(){
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/spotify/verify?userId=' + localStorage.getItem('userId'), {
                headers: new Headers({
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }),
            })
            .then(response => response.json())
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }
    async function getSparkRecommendedSongs(){
        setLoadingButtonText(true);
        try {
            await fetch(process.env.REACT_APP_VINYL_RECOMMENDER + '/songs',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "text" : userPreference,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    setSparkRecommendedSongs(data)
                    setLoadingButtonText(false);
                })
        } catch (error) {
            console.error('Error fetching user:', error);
            setLoadingButtonText(false);
        }
    }
    async function getSpotifyRecommendedSongs(){
        setLoadingButtonSpotify(true);
        let artists = [];
        let genres = [];
        topSpotifySongs && topSpotifySongs.map((song) => {
            song.artists.split(',').map((artist) => (
                artists.push(artist.trimStart())
            ))
        })
        topSpotifyArtists && topSpotifyArtists.map((artist) => {
            artists.push(artist.name);
            artist.genres.split(',').map((genre) => (
                genres.push(genre.trimStart())
            ))
        })
        if (artists.length !== 0 || genres.length !== 0)
            try {
                await fetch(process.env.REACT_APP_VINYL_RECOMMENDER + '/spotify',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "artists" : artists,
                        "genres" : genres,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        setSpotifyRecommendedSongs(data);
                        setLoadingButtonSpotify(false);
                    })
            } catch (error) {
                console.error('Error fetching user:', error);
                setLoadingButtonSpotify(false);
            }
    }
    async function getFileRecommendedSongs(){
        setLoadingButtonFile(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await fetch(process.env.REACT_APP_VINYL_RECOMMENDER + '/document',{
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Credentials': true,
                },
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    setFileRecommendedSongs(data);
                    setLoadingButtonFile(false);
                })
        } catch (error) {
            console.error('Error fetching user:', error);
            setLoadingButtonFile(false);
        }
    }

    async function getPlaylistRecommendedSongs(){
        setLoadingButtonPlaylists(true);
        if (playlistsArtists.length !== 0 || playlistsGenres.length !== 0)
            try {
                await fetch(process.env.REACT_APP_VINYL_RECOMMENDER + '/spotify',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "artists" : playlistsArtists,
                        "genres" : playlistsGenres,
                    }),
                })
                    .then(response => response.json())
                    .then(data => {
                        setPlaylistsRecommendedSongs(data);
                        setLoadingButtonPlaylists(false);
                    })
            } catch (error) {
                console.error('Error fetching user:', error);
                setLoadingButtonPlaylists(false);
            }
    }
    return (
       <CustomLayout>
           <Container className="mt-3 container-scrollable-recommender">
               <Tabs
                   defaultActiveKey="preferences"
                   id="justify-tab-example"
                   className="mb-4 recommendation-tab"
                   variant="underline"
               >
                   <Tab eventKey="preferences" title="Your Preferences">
                       <Row className='d-flex justify-content-center mb-3'>
                           <Col xs={12} className="d-flex w-50">
                               <input type="text" className="form-control rounded mx-3" placeholder="Find vinyls by your tastes(I love/hate rock...)"
                                      onChange={(e) => setUserPreference(e.target.value)}/>
                               <Button disabled={loadingButtonText} onClick={ () => getSparkRecommendedSongs()}>
                                   {loadingButtonText ?
                                       <Spinner
                                           as="span"
                                           animation="border"
                                           size="sm"
                                           role="status"
                                           aria-hidden="true"
                                       /> :
                                        "Find"
                                   }
                               </Button>
                           </Col>
                       </Row>
                       <Row>
                           {
                               sparkRecommendedSongs &&
                               sparkRecommendedSongs.map((song, index) => (
                                    DisplayVinyl(song = {song})
                               ))}
                       </Row>
                   </Tab>
                   <Tab eventKey="spotify" title="Spotify">
                       <h1 className="fs-3 fw-bold text-light mb-2 mx-3">Favorites songs</h1>
                       <Row>
                           {
                               topSpotifySongs &&
                               topSpotifySongs.map((song, index) => (
                                   <Col key={song.id} xs={12} sm={6} md={4} lg={3} xl={2} className="mb-3 d-flex">
                                       <Card className="vinyl-card-recommendations">
                                           <Card.Img src={song.url} />
                                           <Card.Body typeof="mo:Track">
                                               <Card.Title className="text-light text-cart-title">
                                                   <a property="dc:url" href={song.spotifyUrl}>
                                                       <span property="dc:title">{song.name}</span>
                                                   </a>
                                               </Card.Title>
                                               <Card.Text typeof="mo:MusicGroup" className="text-secondary text-cart-body">
                                                       <span property="foaf:name">{song.artists}</span>
                                               </Card.Text>
                                           </Card.Body>
                                       </Card>
                                   </Col>
                               ))}
                       </Row>
                       <Row className='d-flex justify-content-center w-100 mt-3 mb-3'>
                           <hr className="h-5 text-secondary mt-2 mb-1 w-100" />
                       </Row>
                       <h1 className="fs-3 fw-bold text-light mb-3 mx-3">Favorites artists</h1>
                       <Row>
                           {
                               topSpotifyArtists &&
                               topSpotifyArtists.map((artist, index) => (
                                   <Col key={index} xs={12} sm={6} md={4} lg={3} xl={2} className="mb-3 d-flex">
                                       <Card className="vinyl-card-recommendations">
                                           <Card.Img src={artist.url} />
                                           <Card.Body typeof="mo:MusicGroup">
                                               <Card.Title className="text-light text-cart-title">
                                                   <a property="foaf:url" href={artist.urlSpotify}>
                                                       <span property="foaf:name">{artist.name}</span>
                                                   </a>
                                               </Card.Title>
                                               <Card.Text className="text-secondary text-cart-body">
                                                   <span property="dc:genre">{artist.genres}</span>
                                               </Card.Text>
                                           </Card.Body>
                                       </Card>
                                   </Col>
                               ))}
                       </Row>
                   </Tab>
                   <Tab eventKey="spotify-recommendations" title="Spotify Recommendations">
                       <Row className='d-flex justify-content-center'>
                           <Col xs={12} className="d-flex w-25">
                               <div>
                                   <label className="text-secondary fs-8">Find recommendation based on your Spotify recommended songs</label>
                               </div>
                               <div>
                                   <Button disabled={loadingButtonSpotify} onClick={ () => getSpotifyRecommendedSongs()}>
                                       {loadingButtonSpotify ?
                                           <Spinner
                                               as="span"
                                               animation="border"
                                               size="sm"
                                               role="status"
                                               aria-hidden="true"
                                           /> :
                                            "Find"
                                       }
                                   </Button>
                               </div>
                           </Col>
                       </Row>
                       <Row>
                           {
                               spotifyRecommendedSongs &&
                               spotifyRecommendedSongs.map((song, index) => (
                                   DisplayVinyl(song = {song})
                               ))}
                       </Row>
                   </Tab>
                   <Tab eventKey="local-file" title="Local file">
                       <Row className='d-flex justify-content-center'>
                           <Col xs={12} className="d-flex w-50">
                               <div className="mx-3">
                                   <Form.Control
                                       type="file"
                                       accept=".xspf"
                                       id="file"
                                       name="file"
                                       onChange={(e) => setFile(e.target.files[0])}
                                   />
                                   <Form.Text className="text-secondary">
                                       Click on the label to choose a file. Only .xspf files are allowed.
                                   </Form.Text>
                               </div>
                               <div>
                                   <Button disabled={loadingButtonFile} onClick={ () => getFileRecommendedSongs()}>
                                       {loadingButtonFile ?
                                           <Spinner
                                               as="span"
                                               animation="border"
                                               size="sm"
                                               role="status"
                                               aria-hidden="true"
                                           /> :
                                           "Find"
                                       }
                                   </Button>
                               </div>
                           </Col>
                       </Row>
                       <Row>
                           {
                               fileRecommendedSongs &&
                               fileRecommendedSongs.map((song, index) => (
                                   DisplayVinyl(song = {song})
                               ))}
                       </Row>
                   </Tab>
                   <Tab eventKey="playlists-recommendations" title="Your Playlists">
                       <Row className='d-flex justify-content-center'>
                           <Col xs={12} className="d-flex w-25">
                               <div>
                                   <label className="text-secondary fs-8">Find recommendation based on your playlists songs</label>
                               </div>
                               <div>
                                   <Button disabled={loadingButtonPlaylists} onClick={ () => getPlaylistRecommendedSongs()}>
                                       {loadingButtonPlaylists ?
                                           <Spinner
                                               as="span"
                                               animation="border"
                                               size="sm"
                                               role="status"
                                               aria-hidden="true"
                                           /> :
                                           "Find"
                                       }
                                   </Button>
                               </div>
                           </Col>
                       </Row>
                       <Row>
                           {
                               playlistsRecommendedSongs &&
                               playlistsRecommendedSongs.map((song, index) => (
                                   DisplayVinyl(song = {song})
                               ))}
                       </Row>
                   </Tab>
               </Tabs>
           </Container>
       </CustomLayout>
   )
}
