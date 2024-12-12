import axios from 'axios';
import * as React from 'react';
import Button from '@mui/material/Button'
import "./App.css";
import {AppBar, Box, Card, CardActionArea, DialogTitle, Input, Typography} from "@mui/material";


class App extends React.Component {
    state = {
        selectedFile: null,
        llm_response: null
    };
    onFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };

    onFileUpload = () =>{
        const formData = new FormData();
        formData.append(
            'file',
            this.state.selectedFile,
            this.state.selectedFile.name
        );

        console.log(this.state.selectedFile);

        // send request to backend
        axios.post("/api/load_data", formData)
            .then(response =>{
                console.log("File upload response:", response);
            })
            .catch(error =>{
                console.error(error);
            })

    };

    onGetLLMResponse = () => {
        axios.get("api/llm/response")
            .then(response =>{
                this.setState({llm_response: response.data});
                console.log("llm response:", response);
            })
            .catch(error =>{
                console.error(error);
            })

    };

    scheduleData = () => {
        if(this.state.llm_response){
            return(
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="auto"
                    height="auto"
                >
                    <Card
                        sx={{ maxWidth: 400, p: 2}}
                        elevation={12}
                        alignItems = "left"
                    >
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, p: 1 }} align={"left"}>
                            Recommended Post Schedule
                        </Typography>
                        <Typography variant="body1" component="div" sx={{ flexGrow: 1, p: 1 }} align={"left"}>
                            {this.state.llm_response}
                        </Typography>
                    </Card>
                </Box>
            );
        }
        else{
            return(
               <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="auto"
                    height="auto"
                >
                    <Card
                        sx={{ maxWidth: 400, p: 2}}
                        elevation={12}
                        alignItems = "left"
                    >
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, p: 1 }} align={"left"}>
                            Generate Post Schedule
                        </Typography>
                    </Card>
                </Box>
            );
        }
    }

    render() {
        return(
            <>
            <Box sx = {{flexGrow: 1}}>
                <AppBar position = {"static"}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1, p: 1 }} align={"center"}>
                        Post Scheduler v0
                  </Typography>
                </AppBar>
            </Box>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="auto"
                height="auto"
            >
                <Card
                    sx={{ maxWidth: 400, p: 2}}
                    elevation={12}
                    alignItems = "center"
                >
                    <DialogTitle align={"center"}>Upload Inventory File</DialogTitle>
                    <CardActionArea>
                        <label htmlFor="file-input">
                            <Input id="file-input" type="file" onChange={this.onFileChange}/>
                        </label>
                        <Box
                            display={"flex"}
                            justifyContent={"flex-end"}
                        >
                            <Button
                            variant="contained"
                            onClick={this.onFileUpload}
                            >
                            Upload File
                            </Button>
                        </Box>
                    </CardActionArea>
                </Card>
            </Box>

            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="auto"
                height="auto" // Full viewport height
                >
                <Button
                    variant="contained"
                    onClick={this.onGetLLMResponse}
                    elevation={12}
                >
                    Generate Schedule
                </Button>
            </Box>
            {this.scheduleData()}
            </>

        );
    }
}

export default App;
