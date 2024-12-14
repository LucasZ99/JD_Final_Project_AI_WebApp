import axios from 'axios';
import * as React from 'react';
import Button from '@mui/material/Button'
import "./App.css";
import {
    AppBar,
    Box,
    Card,
    CardActionArea,
    CardContent, Checkbox,
    DialogTitle, FormControlLabel,
    FormGroup,
    Input,
    TextField,
    Typography
} from "@mui/material";
import "./ROUTES.js"
import {BUILD_SCHEDULE, CHAT_QUESTION, UPLOAD_DATA} from "./ROUTES";

class App extends React.Component {
    state = {
        selected_file: null,
        llm_response: null,
        chat_question: null,
        question_answer: null,
        num_items: 5,
        incl_prices: null,
        start_date: null,
        end_date: null,
    }

    handleInclPricesChange = (event) => {
            this.setState({incl_prices: event.target.checked});
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

    onFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };



    onQuestionChange = (event) => {
        this.setState({chat_question: event.target.value});
        console.log(event.target.value);
    }

    onFileUpload = () =>{
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

    onGetScheduleResponse = () => {
        console.log(this.state.start_date + "\n" + this.state.end_date + "\n" + this.state.num_items + "\n" + this.state.incl_prices);
        // axios.get(BUILD_SCHEDULE)
        //     .then(response =>{
        //         this.setState({llm_response: response.data});
        //         console.log("llm response:", response);
        //     })
        //     .catch(error =>{
        //         console.error(error);
        //     })
    };

    onGetQuestionResponse = () => {
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

    questionAnswerData = () =>{
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
    fileData = () =>{
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
                            <label htmlFor="file-input">
                                <Input id="file-input" type="file" onChange={this.onFileChange}/>
                            </label>
                            <Box
                                display={"flex-grow"}
                                align={"center"}
                            >
                                <Button
                                variant="contained"
                                onClick={this.onFileUpload}
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
    scheduleData = () => {
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
                        <CardActionArea>
                            <FormGroup>

                                <Checkbox
                                    checked ={this.state.incl_prices}
                                    onChange={this.state.handleInclPricesChange}
                                >
                                    Include Prices
                                </Checkbox>
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
                                />
                                <TextField
                                    type={"date"}
                                    required={true}
                                    id={"outlined-required"}
                                    label={"End Date"}
                                    value={this.state.start_date}
                                    onChange={this.handleEndDateChange}
                                />
                                <Button
                                    variant="contained"
                                    onClick={this.onGetScheduleResponse}
                                    elevation={12}
                                    fullWidth
                                >
                                    Generate Schedule
                                </Button>
                            </FormGroup>

                        </CardActionArea>
                        <CardContent>
                            <Typography variant="h6" component="div" align={"center"}>
                                Recommended Post Schedule
                            </Typography>
                            <Typography variant="body1" component="div" sx={{ flexGrow: 1, p: 1 }} align={"left"}>
                                {this.state.llm_response}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
                </>
                );
    }

    inventoryCard = () =>{
        return(
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
                                    onChange={this.onQuestionChange}
                                    multiline
                                    minRows={4}
                                    variant="filled"
                                    fullWidth
                                />
                            </Box>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    onClick={this.onGetQuestionResponse}
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
                            Post Scheduler v0
                      </Typography>
                    </AppBar>
                </Box>

                {this.fileData()}
                {this.scheduleData()}
                {this.inventoryCard()}
                {this.questionAnswerData()}
            </>

        );
    }
}

export default App;
