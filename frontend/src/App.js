// App.js
import React, { Component } from "react";
import Modal from "./Components/Modal";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewCompleted: false,
      activeItem: { title: "", description: "", completed: false, time: null },
      taskList: [],
      countdowns: {},
      dissedTasks: {}, // Track which tasks have been dissed
      modal: false,
    };
  }

  componentDidMount() {
    this.refreshList();

    // Countdown updater every second
    this.interval = setInterval(() => {
      const countdowns = {};
      this.state.taskList.forEach((item) => {
        if (item.time) {
          const now = new Date();
          const targetTime = new Date();
          const [hours, minutes] = item.time.split(":").map(Number);
          targetTime.setHours(hours, minutes, 0, 0);

          let diff = targetTime - now;
          if (diff < 0) diff = 0;
          countdowns[item.id] = diff;

          // Trigger diss when countdown reaches 0
          if (diff === 0 && !this.state.dissedTasks[item.id]) {
            this.generateDiss(item.id);
          }
        }
      });
      this.setState({ countdowns });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  // Refresh task list from backend
  refreshList = () => {
    axios
      .get("http://localhost:8000/api/tasks/")
      .then((res) => this.setState({ taskList: res.data }))
      .catch((err) => console.log(err));
  };

  // Mark task as done
  markAsDone = (item) => {
    const updatedItem = { ...item, completed: true };
    axios
      .put(`http://localhost:8000/api/tasks/${item.id}/`, updatedItem)
      .then(() => this.refreshList());
  };

  // Generate diss from backend/OpenAI
  generateDiss = (taskId) => {
    axios
      .post("http://localhost:8000/api/diss/", { task_id: taskId })
      .then((res) => {
        this.setState((prev) => {
          const taskList = prev.taskList.map((task) =>
            task.id === taskId ? { ...task, diss: res.data.message } : task
          );
          return {
            taskList,
            dissedTasks: { ...prev.dissedTasks, [taskId]: true },
          };
        });
      })
      .catch((err) => console.log(err));
  };

  displayCompleted = (status) => {
    this.setState({ viewCompleted: status });
  };

  renderTabList = () => (
    <div className="my-5 tab-list">
      <span
        onClick={() => this.displayCompleted(true)}
        className={this.state.viewCompleted ? "active" : ""}
      >
        Completed
      </span>
      <span
        onClick={() => this.displayCompleted(false)}
        className={this.state.viewCompleted ? "" : "active"}
      >
        Incomplete
      </span>
    </div>
  );

  renderItems = () => {
    const { viewCompleted } = this.state;
    const newItems = this.state.taskList.filter(
      (item) => item.completed === viewCompleted
    );

    return newItems.map((item) => (
      <li
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span
          className={`todo-title mr-2 ${
            viewCompleted ? "completed-todo" : ""
          }`}
          title={item.description}
        >
          {item.title}
        </span>

        <span>
          <button
            onClick={() => this.editItem(item)}
            className="btn btn-secondary mr-2"
          >
            Edit
          </button>
          <button
            onClick={() => this.handleDelete(item)}
            className="btn btn-danger mr-2"
          >
            Delete
          </button>
        
          {!item.completed && (
            <button
              onClick={() => this.markAsDone(item)}
              className="btn btn-success mr-2"
            >
              Done
            </button>
          )}

          {!item.completed && (
              this.state.countdowns[item.id] != null
                ? Math.floor(this.state.countdowns[item.id] / 1000) + "s left"
                : "No time set"
            )}
          

          {!item.completed && item.diss && (
            <div className="text-danger mt-2">{item.diss}</div>
          )}

        </span>
      </li>
    ));
  };

  toggle = () => this.setState({ modal: !this.state.modal });

  handleSubmit = (item) => {
    this.toggle();
    if (item.id) {
      axios
        .put(`http://localhost:8000/api/tasks/${item.id}/`, item)
        .then(() => this.refreshList());
      return;
    }
    axios.post("http://localhost:8000/api/tasks/", item).then(() => this.refreshList());
  };

  handleDelete = (item) => {
    axios.delete(`http://localhost:8000/api/tasks/${item.id}/`).then(() => this.refreshList());
  };

  createItem = () => {
    const item = { title: "", description: "", completed: false, time: null };
    this.setState({ activeItem: item, modal: true });
  };

  editItem = (item) => this.setState({ activeItem: item, modal: true });

  render() {
    return (
      <main className="content">
        <h1 className="text-success text-uppercase text-center my-4">
          Vonito's Overly Critical To-do App
        </h1>
        <div className="row">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div>
                <button onClick={this.createItem} className="btn btn-info">
                  Add task
                </button>
              </div>
              {this.renderTabList()}
              <ul className="list-group list-group-flush">{this.renderItems()}</ul>
            </div>
          </div>
        </div>

        {this.state.modal && (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        )}
      </main>
    );
  }
}

export default App;
