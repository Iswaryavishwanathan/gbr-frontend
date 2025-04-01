import React, { Component } from "react";
import axios from "axios";
import "./SiloDashboard.css";

class SiloDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: "",
            endDate: "",
            siloType: "",  
            reportType: "", 
            data: {},
            message: "",
            messageType: "" 
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    fetchData = async () => {
        const { startDate, endDate, siloType, reportType } = this.state;
    
        if (!startDate || !endDate || !siloType || !reportType) {
            this.setState({ message: "Please select all fields.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000); // Clear after 3 sec
            return;
        }
    
        try {
            const response = await axios.get("http://localhost:8080/silo/data", {
                params: { startDate, endDate, siloType, reportType }
            });
    
            this.setState({ data: response.data, message: "Data fetched successfully!", messageType: "success" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        } catch (error) {
            this.setState({ message: "Error fetching data. Check backend connection.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        }
    };
    
    exportToExcel = async () => {
        const { startDate, endDate, siloType, reportType } = this.state;
    
        if (!startDate || !endDate || !siloType || !reportType) {
            this.setState({ message: "Please select all fields.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
            return;
        }
    
        try {
            const response = await axios.get("http://localhost:8080/silo/export", {
                params: { siloType, reportType, startDateTime: startDate, endDateTime: endDate },
                responseType: "blob",
            });
    
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "silo_report.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
    
            this.setState({ message: "✅ Report exported successfully!", messageType: "success" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        } catch (error) {
            this.setState({ message: "Error exporting data. Check backend.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        }
    };
    
    printReport = () => {
        window.print();
    };
    

    render() {
        const { data, siloType, reportType, message, messageType } = this.state;

        return (
            <div className="container">
                <h2>Silo Dashboard</h2>
                <div className="input-container">
                    <label>Silo Type:</label>
                    <select name="siloType" value={siloType} onChange={this.handleChange} required>
                        <option value="" disabled>Select Silo</option>
                        <option value="Meal Silo">Meal Silo</option>
                        <option value="Bulk Silo">Bulk Silo</option>
                    </select>

                    <label>Report Type:</label>
                    <select name="reportType" value={reportType} onChange={this.handleChange} required>
                        <option value="" disabled>Select Report Type</option>
                        <option value="Received Report">Received Report</option>
                        <option value="Movement Report">Movement Report</option>
                    </select>

                    <label>Start Date:</label>
                    <input type="datetime-local" name="startDate" onChange={this.handleChange} required />

                    <label>End Date:</label>
                    <input type="datetime-local" name="endDate" onChange={this.handleChange} required />
                    <div className="button-container">

                    <button onClick={this.fetchData}>Fetch Data</button>
                    <button onClick={this.exportToExcel} className="export-btn">Export to Excel</button>
                    <button onClick={this.printReport} className="print-btn">Print Report</button>
                    </div>

                </div>

                {message && <p className={messageType === "success" ? "success-msg" : "error-msg"}>{message}</p>}

                {Object.keys(data).length > 0 && (
                    <div>
                        <h3>Silo Data</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>DateTime</th>
                                    <th>Silo Name</th>
                                    <th>Material Name</th>
                                    <th>Actual Weight</th>
                                    <th>Intake</th>
                                    <th>Destination Bin</th>
                                    {reportType === "Received Report" && <th>Weight Added</th>}
                                    {reportType === "Movement Report" && <th>Weight Taken</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(data).flat().map((record, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{new Date(record.DateTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                        <td>{record.SiloName}</td>
                                        <td>{record.MaterialName}</td>
                                        <td>{record.ActualWeight}</td>
                                        <td>{record.Intake}</td>
                                        <td>{record.DestinationBin}</td>
                                        {reportType === "Received Report" && <td>{record.WeightAdded || "-"}</td>}
                                        {reportType === "Movement Report" && <td>{record.WeightTaken || "-"}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }
}

export default SiloDashboard;
