import React, {useEffect, useState} from 'react';
import CustomLayout from "../../components/Layout";
import {Container, Row, Col, Card, Nav, Button, Form, Spinner} from 'react-bootstrap';
import {useParams} from "react-router-dom";
import DataTable, {createTheme} from "react-data-table-component";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Moment from 'moment';
import './Playlists.scss';
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import EditIcon from "@mui/icons-material/Edit";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from "react-router";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

export default function PlaylistChange() {

    const [songs, setSongs] = useState([]);
    const [shownSongs, setShownSongs] = useState([]);
    const [loadingButton, setLoadingButton] = useState(false)
    const [playlist, setPlaylist] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [changeNameModal, setChangeNameModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState();
    const [errorNewNamePlaylist, setErrorNewNamePlaylist] = useState(false);
    const navigate = useNavigate();
    const id = useParams()['id'];

    useEffect(() => {
        loadSongs();
    }, []);

    const loadPlaylist = async () => {
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/playlists/' + id, {
                headers: new Headers({
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }),
            })
                .then(response => response.json())
                .then(data => {
                    setPlaylist(data);
                    setPlaylistSongs(songs.filter(song => data.songIds.includes(song.id)));
                })
        } catch (error) {
            console.error('Error fetching playlist:', error);
        }
    };
    const loadSongs = async () => {
        try {
            await fetch(process.env.REACT_APP_BACKEND_SERVER + '/api/songs', {
                headers: new Headers({
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                }),
            })
                .then(response => response.json())
                .then(data => {setSongs(data); setShownSongs(data)})
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    };

    useEffect(() => {
        if(id)
            loadPlaylist();
        else {
            setNewPlaylistName("New Playlist");
        }
    }, [songs]);

    useEffect(() => {
        setNewPlaylistName(playlist.title);
    }, [playlist]);

    const columns = [
        {
            name: 'Title',
            selector: row => row.vinylLabel,
        },
        {
            name: 'Artist',
            selector: row => row.creator,
        },
        {
            name: 'Release date',
            selector: row => new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(row.date)),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div>
                    <IconButton aria-label="delete" color="error" onClick={ () => {excludeFromPlaylistSongList(row.id)}}>
                        <DeleteIcon/>
                    </IconButton>
                </div>
            )
        },
    ];
    createTheme('datatableTheme', {
        text: {
            primary: '#838383',
            secondary: '#2aa198',
        },
        background: {
            default: '#212121',
        },
        context: {
            background: '#cb4b16',
            text: '#FFFFFF',
        },
        divider: {
            default: 'rgba(255,255,255,.12)',
        },
    });
    const conditionalRowStyles = [
        {
            when: row => row.id != null,
            style: {
                borderBottom: 'none',
                color: 'white',
                fontSize: '15px',
                fontFamily: 'Franie Geometric Sans Family'
            },
        },
        {
            when: row => row.id == null,
            style: {
                color: '#a1a1a1',
                fontSize: '15px',
                fontFamily: 'Franie Geometric Sans Family'
            },
        },
    ];
    function handleSearch(value) {
        if(value.length > 0)
            setShownSongs(songs.filter(song =>
                song.title.toLowerCase().includes(value.toLowerCase())));
        else
            setShownSongs([]);
    }

    function addSongToPlaylist(songId) {
        const newSongIds = [...playlistSongs.map(song => song.id), songId];
        setPlaylistSongs(songs.filter(song => newSongIds.includes(song.id)));

        if(id)
            setPlaylist({
                ...playlist,
                songIds: newSongIds,
            });
    }
    function excludeFromPlaylistSongList(id) {
        const newSongIds = playlistSongs.map(song => song.id).filter(songId => songId !== id);
        setPlaylistSongs(songs.filter(song => newSongIds.includes(song.id)));
        if(id)
            setPlaylist({
                ...playlist,
                songIds: newSongIds,
            });
    }

    function changePlaylistDetails() {
        setErrorNewNamePlaylist(newPlaylistName.trim() === '');
        if(newPlaylistName.trim() !== '') {
            setPlaylist({
                ...playlist,
                title: newPlaylistName,
            });

            setErrorNewNamePlaylist(false);
            setChangeNameModal(false);
        }
    }

    function onHideModal() {
        setChangeNameModal(false);
        if(id) {
            setNewPlaylistName(playlist.title)
        } else {
            setNewPlaylistName("New Playlist")
        }
    }

    const changePlaylist = async (e) => {

        setLoadingButton(true);
        const apiUrl = id
                        ? process.env.REACT_APP_BACKEND_SERVER + '/api/playlists/' + id + '/' + localStorage.getItem('userId')
                        : process.env.REACT_APP_BACKEND_SERVER + '/api/playlists'
                        ;

        try {
            const response = await fetch(apiUrl, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify(
                    id
                        ? playlist
                        : {
                            title: newPlaylistName,
                            songIds: playlistSongs.map(song => song.id),
                            userIds: [localStorage.getItem('userId')],
                            createdDate: moment(),
                        }
                ),
            });

            setLoadingButton(false);
            if(response.status === 200) {
                navigate('/playlists');
            } else {
                toast.error("Update playlist failed, please try again later!", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            }
        } catch (error) {
            setLoadingButton(true);
            console.error('Error during login:', error);
        }
    };
    return (
        <CustomLayout>
            <Container className="mt-2">
                <Row className="container-scrollable-songs border-0">
                    <Row className='d-flex justify-content-center'>
                        <Col xs={12} className="w-50 text-center text-success">
                            {
                                id ? <h3>Edit Playlist</h3> : <h3>Create Playlist</h3>
                            }
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <DataTable
                                title={<span style={{ color: 'white' }}>{ newPlaylistName } <IconButton color='primary' onClick={() => (setChangeNameModal(true))}><EditIcon/></IconButton></span>}
                                columns={columns}
                                data={playlistSongs}
                                fixedHeader
                                actions={
                                    <div className="d-flex">
                                        <Button disabled={loadingButton} className="mx-3" variant="contained" size="small" style={{ backgroundColor: 'white', color: 'black', borderRadius: '30px' }} onClick={() => changePlaylist()}>
                                            {loadingButton &&
                                                <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            }
                                            {id ? ' Edit ' : ' Add ' } Playlist
                                        </Button>
                                    </div>
                                }
                                theme="datatableTheme"
                                conditionalRowStyles={conditionalRowStyles}
                            />
                        </Col>
                    </Row>
                    <Modal
                        show={changeNameModal}
                        onHide={() => onHideModal()}
                        centered
                    >
                        <Modal.Header className="modal-change-name-header">
                            <Modal.Title>
                                <h3 className="fs-3 fw-bold text-light">Edit details</h3>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="modal-change-name-body">
                            <Form.Group className="mb-3 text-light" controlId="title">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type = "text"
                                    value = {newPlaylistName}
                                    onChange = {(e) => setNewPlaylistName(e.target.value)}
                                    required
                                />
                                {errorNewNamePlaylist && <div className="text-danger">Name is required</div>}
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer className="modal-change-name-footer">
                            <Button variant_type='primary' onClick={() => changePlaylistDetails()}> Save </Button>
                        </Modal.Footer>
                    </Modal>
                    <Row className='d-flex justify-content-center w-100'>
                        <hr className="h-5 text-secondary mt-2 mb-2 w-100" />
                    </Row>
                    <Row>
                        <Col>
                            <div className='mt-3'>
                                <h1 className="fs-3 fw-bold text-light mb-2">Find song for your playlist</h1>
                                <Paper
                                    component="form"
                                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 300, background: '#2a2a2a',borderRadius: '30px',border: '2px solid #2a2a2a', '&:focus-within': {border: '2px solid white',}}}
                                >
                                    <IconButton sx={{ p: '10px', color: 'white' }}>
                                        <SearchIcon />
                                    </IconButton>
                                    <InputBase
                                        sx={{ ml: 1, flex: 1, color:'#838383' }}
                                        placeholder="Search song..."
                                        inputProps={{ 'aria-label': 'Search song...' }}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </Paper>
                            </div>
                            <Row className="mx-0 px-0">
                                {
                                    shownSongs.map((song, index) => (
                                        <Row className="d-flex justify-content-between align-items-center song-list mb-2">
                                            <Col xs={6}><span>{song.vinylLabel}</span></Col>
                                            <Col><span>{song.creator}</span></Col>
                                            <Col><span>{new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(song.date))}</span></Col>
                                            <Col className="d-flex justify-content-end">
                                                <button className="button-classic" onClick={ () => addSongToPlaylist(song.id)}>
                                                    Add
                                                </button>
                                            </Col>
                                        </Row>
                                    ))
                                }
                            </Row>
                        </Col>
                    </Row>
                </Row>
            </Container>
        </CustomLayout>
    )
}
