document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    socket.on("initialState", (checkboxStates) => {
      checkboxStates.forEach((checked, index) => {
        document.getElementById(`checkbox-${index}`).checked = checked;
      });
    });
  
    socket.on("checkboxUpdate", (data) => {
      document.getElementById(`checkbox-${data.index}`).checked = data.checked;
    });
  

    const checkboxes = document.querySelectorAll(".checkbox");
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener("change", () => {
        const data = {
          index: index,
          checked: checkbox.checked,
        };
        socket.emit("checkboxChange", data);
      });
    });
  });