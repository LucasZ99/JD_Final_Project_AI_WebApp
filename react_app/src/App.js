import axios from 'axios';
import React, { Component } from "react";

class App extends Component {
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
                return axios.get("api/llm/response");
            })
            .then(response =>{
                this.setState({llm_response: response.data});
                console.log("llm response:", response);
            })
            .catch(error =>{
                console.error(error);
            })

    };

    // display file content after uploading file

    fileData = () => {
        if(this.state.selectedFile){
            if(this.state.llm_response) {
                return (
                    <div>
                        <h2>File Details:</h2>
                        <p>File Name: {this.state.selectedFile.name}</p>

                        <h2>LLM Response</h2>
                        <p>{this.state.llm_response}</p>
                    </div>
                );
            }
            else{
                return (
                    <div>
                        <h2>File Details:</h2>
                        <p>File Name: {this.state.selectedFile.name}</p>
                        <p>LLM Response not available</p>
                    </div>
                );
            }
        } else {
            return (
                <div>
                    <br/>
                    <h4>Choose file before pressing upload button</h4>
                    <p>LLM Response not available</p>
                </div>
            );
        }
    };

    render() {
        return(
            <div>
                <h1>Elcon Threads</h1>
                <h3>Upload your file so the AI can process it</h3>
                <div>
                    <input type="file" onChange={this.onFileChange} />
                    <button onClick={this.onFileUpload}>Upload File</button>
                </div>
                {this.fileData()}
            </div>
        );
    }
}
export default App;
