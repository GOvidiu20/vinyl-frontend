import React, {useEffect, useState} from 'react';
import CustomLayout from "../../components/Layout";
import {Container, Row, Col, Card, Button, Form} from 'react-bootstrap';
import './Home.scss';
import Modal from "react-bootstrap/Modal";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import {toast} from "react-toastify";
import MoreVertIcon from '@mui/icons-material/MoreVert';
export default function Home() {

    const animatedComponents = makeAnimated();
    const [selectedPlaylistOption, setSelectedPlaylistOption] = useState([]);
    const [songs, setSongs] = useState([]);
    const [shownSongs, setShownSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [addSongToPlaylistModal, setAddSongToPlaylistModal] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    useEffect(() => {
        loadSongs();
        loadPlaylists();
    }, []);

    const loadSongs = async () => {
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/songs', {
                headers: new Headers({
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                }),
            })
                .then(response => response.json())
                .then(data => {
                    setSongs(data);
                    setShownSongs(data);
                    console.log(data);
                })
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };
    const loadPlaylists = async () => {
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/playlists/user/' + sessionStorage.getItem('userId'), {
                headers: new Headers({
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                }),
            })
                .then(respone => respone.json())
                .then(data => {
                    let newPlaylistOptions = [];
                    data.forEach((playlist) => {
                        let optionPlaylist = {
                            value: playlist.id,
                            label: playlist.title
                        }
                        newPlaylistOptions = [...newPlaylistOptions, optionPlaylist];
                    });
                    setPlaylists(newPlaylistOptions)
                })
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const addSongToPlaylist = async (e) => {
        const apiUrl = process.env.REACT_APP_BACKEND_SERVER + '/api/playlists/' + selectedPlaylistOption.value + '/songs/' + selectedSong.id + '/user/' + sessionStorage.getItem('userId');

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                },
            });
            if(response.status === 200) {
                setAddSongToPlaylistModal(false)
                toast.success("Song added to playlist successfully!", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            } else {
                toast.error("Update playlist failed, please try again later!", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    }

    function handleSearch(value) {
        setShownSongs(songs.filter(song =>
            song.title.toLowerCase().includes(value.toLowerCase())));
    }

    function onHideModal() {
        setAddSongToPlaylistModal(false)
        setSelectedPlaylistOption([]);
    }

    const changeOptionPlaylists = event => {
        setSelectedPlaylistOption(event);
    }

    function selectSongButton(song) {
        setAddSongToPlaylistModal(true)
        setSelectedSong(song);
    }

    return (
       <CustomLayout>
           <Container className="mt-5">
               <Row className='d-flex justify-content-center'>
                   <Col xs={12} className="w-50">
                       <input type="text" className="form-control rounded" placeholder="Search your favourite vinyl..."
                              onChange={(e) => handleSearch(e.target.value)}/>
                   </Col>
               </Row>
               <Row className="mt-5 container-scrollable">
                   {
                       shownSongs.length !== 0 ?
                           shownSongs.map((song, index) => (
                           <Col key={song.id} xs={12} sm={12} md={4} lg={3} xl={2} className="mb-3">
                               <Button className="p-0 border-0" onClick={() => selectSongButton(song)}>
                                   <Card className="vinyl-cart">
                                       <MoreVertIcon className="button-card" sx={{ color: '#1ed760' }} fontSize="large"/>
                                       <Card.Img src="https://newjams-images.scdn.co/image/ab67647800003f8a/dt/v3/release-radar/ab6761610000e5eb6cab9e007b77913d63f12835/en" />
                                       <Card.Body>
                                           <Card.Title className="text-light text-cart-title">
                                               {song.title.length > 15 ? song.title.slice(0, 15) + '...' : song.title}
                                           </Card.Title>
                                           <Card.Text className="text-secondary text-cart-body">
                                               Author
                                           </Card.Text>
                                       </Card.Body>
                                   </Card>
                               </Button>
                           </Col>
                   ))
                       : <p className="text-secondary">No vinyls found</p>
                   }
               </Row>
               <Modal
                   show={addSongToPlaylistModal}
                   onHide={() => onHideModal()}
                   centered
               >
                   <Modal.Header className="modal-change-name-header">
                       <Modal.Title>
                           <div className="fs-4 fw-semibold text-light">{selectedSong && selectedSong.title}</div>
                           <div className="fs-5 fw-light text-secondary">Author</div>
                       </Modal.Title>
                   </Modal.Header>
                   <Modal.Body className="modal-change-name-body">
                       <Row className="w-100 h-100">
                           <Col xs={4}>
                               <img src="https://newjams-images.scdn.co/image/ab67647800003f8a/dt/v3/release-radar/ab6761610000e5eb6cab9e007b77913d63f12835/en" />
                           </Col>
                           <Col xs={8}>
                               <Form.Group className="mb-3 text-light" controlId="title">
                                   <Form.Label>Add Song to your playlists</Form.Label>
                                   <Select
                                       className="text-dark"
                                       closeMenuOnSelect={true}
                                       components={animatedComponents}
                                       //isMulti
                                       options={playlists}
                                       onChange={changeOptionPlaylists}
                                   />
                                   {/*{errorNewNamePlaylist && <div className="text-danger">Name is required</div>}*/}
                               </Form.Group>
                           </Col>
                       </Row>

                   </Modal.Body>
                   <Modal.Footer className="modal-change-name-footer">
                       <Button variant_type='primary' onClick={addSongToPlaylist}> Save </Button>
                   </Modal.Footer>
               </Modal>
           </Container>
       </CustomLayout>
   )
}
