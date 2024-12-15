import axios from 'axios';
import * as React from 'react';
import Button from '@mui/material/Button'
import "./App.css";
import {
    AppBar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    DialogTitle,
    FormGroup, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from "@mui/material";
import "./ROUTES.js"
import {BUILD_SCHEDULE, CHAT_QUESTION, UPLOAD_DATA} from "./ROUTES";
import Papa from 'papaparse';

class App extends React.Component {
    state = {
        selected_file: null,
        llm_response: null,
        chat_question: null,
        question_answer: null,
        num_items: 5,
        additional_info: null,
        start_date: null,
        end_date: null,
        parsed_schedule: null
    };

    handleAdditionalInfoChange = (event) => {
            this.setState({additional_info: event.target.value});
    };

    handleStartDateChange = (event) => {
        this.setState({start_date: event.target.value});
    };

    handleEndDateChange = (event) => {
        this.setState({end_date: event.target.value});
    };

    handleNumItemsChange = (event) => {
        this.setState({num_items: event.target.value});
    }

    handleFileChange = (event) => {
        this.setState({ selected_file: event.target.files[0] });
    };

    handleQuestionChange = (event) => {
        this.setState({chat_question: event.target.value});
        console.log(event.target.value);
    }

    parseScheduleResponse = () => {
        Papa.parse(this.state.llm_response, {
            header: true,
            complete: (result) => {
                this.setState({parsed_schedule: result.data});
            }
        })
    }

    onPostFile = () =>{
        const formData = new FormData();
        formData.append(
            'file',
            this.state.selected_file,
            this.state.selected_file.name
        );

        console.log(this.state.selected_file);

        // send request to backend
        axios.post(UPLOAD_DATA, formData)
            .then(response =>{
                console.log("File upload response:", response);
            })
            .catch(error =>{
                console.error(error);
            })
    };

    onPostScheduleQuestion = () => {
        const data = {
            num_items: this.state.num_items,
            start_date: this.state.start_date,
            end_date: this.state.end_date,
            additional_info: this.state.additional_info
        }
        axios.post(BUILD_SCHEDULE, data, {
            headers: {'Content-Type': 'application/json'}
        })
            .then(response => {
                this.setState({llm_response: response.data});
            })
            .catch(error =>{console.error(error)});
    };

    onPostQuestion = () => {
        const data = {
            question: this.state.chat_question
        };
        axios.post(CHAT_QUESTION, data, {
            headers: {'Content-Type': 'application/json'}
        })
            .then(response =>{
                this.setState({question_answer: response.data});
                console.log("Question answer:", response);
            })
            .catch(error =>{
                console.error(error);
            })
    }

    chatData = () =>{
        if(this.state.question_answer){
            return(
                <Box
                    display="flex-grow"
                    justifyContent="center"
                    alignItems="center"
                    alignSelf="center"
                >
                    <Card
                        elevation={12}
                        alignItems = "center"
                        alignSelf="center"
                    >
                        <CardContent>
                            <Typography variant="body1" component="div" sx={{ flexGrow: 1, p: 1 }} align={"left"}>
                                {this.state.question_answer}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            );
        }
    }

    fileInput = () =>{
        return(
            <Box
                display="flex-grow"
                justifyContent="center"
                alignItems="center"
                alignSelf="center"
            >
                <Card
                    elevation={12}
                    alignItems = "center"
                    alignSelf="center"
                >
                    <CardContent>
                        <DialogTitle align={"center"}>Upload Inventory File</DialogTitle>
                        <CardActionArea>
                            <TextField
                                type = "file"
                                onChange={this.handleFileChange}
                                fullWidth
                            />
                            <Box
                                display={"flex-grow"}
                                align={"center"}
                            >
                                <Button
                                variant="contained"
                                onClick={this.onPostFile}
                                align = {"center"}
                                fullWidth
                                >
                                Upload File
                                </Button>
                            </Box>
                        </CardActionArea>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    scheduleInput = () => {
            return(
                <>

                <Box
                    display="flex-grow"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Card
                        display={"flex-grow"}
                        elevation={12}
                        alignItems = {"center"}
                    >
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, p: 3 }} align={"center"}>
                                Generate a Post Schedule
                        </Typography>

                        <CardActionArea>
                            <FormGroup>
                                <TextField
                                    required={true}
                                    id={"outlined-required"}
                                    label={"# Items"}
                                    defaultValue={5}
                                    value={this.state.num_items}
                                    onChange={this.handleNumItemsChange}
                                />

                                <TextField
                                    type={"date"}
                                    required={true}
                                    id={"outlined-required"}
                                    label={"Start Date"}
                                    value={this.state.start_date}
                                    onChange={this.handleStartDateChange}
                                    InputLabelProps={{shrink: true}}
                                />
                                <TextField
                                    type={"date"}
                                    required={true}
                                    id={"outlined-required"}
                                    label={"End Date"}
                                    value={this.state.end_date}
                                    onChange={this.handleEndDateChange}
                                    InputLabelProps={{shrink: true}}
                                />
                                <TextField
                                    id="filled-multiline-flexible"
                                    label="Additional Info"
                                    value={this.state.additional_info}
                                    onChange={this.handleAdditionalInfoChange}
                                    multiline
                                    minRows={4}
                                    variant="filled"
                                />
                                <Button
                                    variant="contained"
                                    onClick={this.onPostScheduleQuestion}
                                    elevation={12}
                                    fullWidth
                                >
                                    Generate Schedule
                                </Button>
                            </FormGroup>

                        </CardActionArea>
                        <CardContent>
                            {this.scheduleOutput()}
                        </CardContent>
                    </Card>
                </Box>
                </>
            );
    }

    scheduleOutput = () => {
        if(this.state.llm_response) {this.parseScheduleResponse()}
        if(this.state.parsed_schedule) {
            return (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {
                                    Object.keys(this.state.parsed_schedule[0]).map((key) => (
                                    <TableCell key={key}>{key}</TableCell>
                                    ))
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.state.parsed_schedule.map((row, index) => (
                                <TableRow key={index}>
                                    {Object.values(row).map((value) => (
                                        <td key={value}>{value}</td>
                                    ))}
                                </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
    }

    inventoryCard = () => {
        return (
            <Box
                display="flex-grow"
                justifyContent="center"
                alignItems="center"
                // width="500"
                // height="auto" // Full viewport height
            >
                <Card
                    elevation={12}
                >
                    <CardContent>
                        <DialogTitle align={"center"}>Chat with your inventory</DialogTitle>
                        <CardActionArea>
                            <Box>
                                <TextField
                                    id="filled-multiline-flexible"
                                    label="Chat"
                                    value={this.state.chat_question}
                                    onChange={this.handleQuestionChange}
                                    multiline
                                    minRows={4}
                                    variant="filled"
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    onClick={this.onPostQuestion}
                                >
                                Submit Question
                                </Button>
                            </Box>
                        </CardActionArea>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    render() {
        return(
            <>
                <Box display={"flex-grow"}>
                    <AppBar position = {"static"}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1, p: 1 }} align={"center"}>
                            Post Scheduler v1
                      </Typography>
                    </AppBar>
                </Box>

                {this.fileInput()}
                {this.scheduleInput()}
                {this.inventoryCard()}
                {this.chatData()}
            </>

        );
    }
}

export default App;
