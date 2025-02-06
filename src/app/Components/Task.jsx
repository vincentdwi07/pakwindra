'use client'
import { useState } from "react"

export default function Task(){
    const [activeTab, setActiveTab] = useState('1');
    const [selectedFile, setSelectedFile] = useState(null);
    const tabsData = {
        1: {
            key: 1,
            instruction: "1. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae porro, quia magni impedit, quaerat exercitationem harum repellat accusamus aut placeat molestias praesentium aperiam sunt architecto suscipit, a explicabo debitis corrupti. Lorem ipsum dolor, sit amet consectetur adipisicing elit. Culpa doloribus neque deserunt nihil, perspiciatis aliquam, eveniet alias pariatur sequi, aliquid id vero repellendus inventore corporis! Expedita placeat rem nisi laborum!",
            educator_note : "Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore esse omnis nam molestiae dolorum reprehenderit iure animi quisquam ipsum, optio odio ratione maiores! At temporibus ea unde ipsam, enim praesentium.",
            ai_note: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde magnam totam doloremque odit dicta nobis iste nulla! Fuga rerum, in est qui quo laudantium iste vero, quod laborum quos dolore!",
            educator_is_correct: true,
            status: "graded"
        },
        2: {
            key: 2,
            instruction: "2. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae porro, quia magni impedit, quaerat exercitationem harum repellat accusamus aut placeat molestias praesentium aperiam sunt architecto suscipit, a explicabo debitis corrupti.",
        },
        3: {
            key: 3,
            instruction: "3. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae porro, quia magni impedit, quaerat exercitationem harum repellat accusamus aut placeat molestias praesentium aperiam sunt architecto suscipit, a explicabo debitis corrupti.",
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        
        if (file) {
            if (file.name.endsWith('.py')) {
                setSelectedFile(file);
                setError('');
            } else {
                setSelectedFile(null);
                setError('Hanya file Python (.py) yang diperbolehkan!');
            }
        }
    };


    // POST FILE KE DATABASE
    const handleSubmit = (event) => {
        event.preventDefault();
        if (selectedFile) {
            console.log('File yang diupload:', selectedFile.name);
        }
    };


    return(
        <>
            <div className="user-task">
                <div className="tab">
                    {Object.keys(tabsData).map((tabKey) =>(
                        <button
                            key={tabKey}
                            className={`tablinks ${activeTab === tabKey ? 'active' : ''}`}
                            onClick={() => setActiveTab(tabKey)}
                        >
                            {tabsData[tabKey].key}
                        </button>
                    ))}
                </div>
                <div className="task-content">
                    <div>
                        {Object.keys(tabsData).map((tabKey) =>(
                            <div key={tabKey} className={`instruction ${activeTab === tabKey ? 'show' : ''}`}>   
                                <p>{tabsData[tabKey].instruction}</p>
                                <form action="">
                                        <div className="mb-2 text-body-secondary">
                                            <label htmlFor="file-input">Upload your python file here:</label>
                                        </div>
                                    <input
                                        type="file"
                                        accept=".py"
                                        onChange={handleFileChange}
                                        id="file-input"
                                        className="form-control"
                                    />
                                    <button type="submit" className="btn-submit-file-user">Submit</button>
                                </form>  
                                {tabsData[tabKey].status === 'graded' ?  
                                    <div className={`user-exam-feedback ${tabsData[tabKey].educator_is_correct ? 'correct' : 'false'}`}>
                                        <div>
                                            <p style={{ fontSize: '1rem' }} className="text-body-secondary">Feedbacks:</p>
                                            <h6 className="p-0 m-0">Chat GPT</h6>
                                            <p>{tabsData[tabKey].ai_note ?? 'No Feedback Added'}</p>
                                            <h6 className="p-0 m-0">Pak Windra</h6>
                                            <p>{tabsData[tabKey].educator_note ?? 'No Feedback Added'}</p>
                                            <p className="m-0 p-0 text-body-secondary">Conclusion:</p>
                                            {tabsData[tabKey].educator_is_correct ? (
                                                <h6 className="text-success m-0 p-0">Correct <span><i className="bi bi-check2"></i></span></h6>
                                            ) : (
                                                <h6 className="text-danger">False <span><i className="bi bi-x-lg"></i></span></h6>
                                            )}
                                        </div>
                                    </div>
                                : ''}   
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}