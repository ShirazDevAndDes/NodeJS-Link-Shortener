document.getElementById("submitURL").onclick = function () {
  const url = document.getElementById("url").value;
  // console.log(url);
  if (url.length > 0) {
    fetch("http://localhost:3000/shortenLink", {
      method: "POST",
      body: JSON.stringify({ url }),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((result) => result.json())
      // .then((data) => console.log(data))
      .then(() => displayRows())
      .catch((error) => console.log(error));
  } else {
    alert("Please enter a URL");
  }
};

function displayRows() {
  document.getElementById("linkRows").innerHTML = "";
  fetch("get_all_shortLinks")
    .then((res) => res.json())
    .then((dbData) => {
      dbData.forEach((data) => {
        const tableRow = `
    <tr>
          <th>${data.original_url}</th>
          <td colspan="1"><a target="_blank" href="http://localhost:3000/${data.shortened_url}">localhost:3000/${data.shortened_url}</a></td>
          <td  class="text-center" colspan="1">${data.click_count}</td>
          <td class="text-center" colspan="1">
            <div class="d-lg-flex" data-id="${data.short_link_id}">
            <button
              class="btn btn-primary btn-edit w-100 me-lg-1 mb-1 mb-lg-0"
              data-bs-toggle="modal"
              data-bs-target="#edit-modal"
            >
              Edit
            </button>
            <button class="btn btn-danger btn-del w-100">Delete</button>
            </div>
          </td>
        </tr>
    `;
        document
          .getElementById("linkRows")
          .insertAdjacentHTML("beforeend", tableRow);
      });
      document.querySelectorAll("tbody a").forEach((link) => {
        link.onclick = function () {
          setTimeout(() => {
            displayRows();
          }, 1000);
        };
      });
      document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.onclick = function () {
          const linkID = btn.parentElement.getAttribute("data-id");

          fetch("get_single_shortLink", {
            method: "POST",
            body: JSON.stringify({ linkID }),
            headers: {
              "content-type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              document.getElementById("editOriginalLink").value =
                data.original_url;
              document
                .getElementById("submit_edit_btn")
                .setAttribute("data-id", data.short_link_id);
            })
            .catch((error) => {
              console.log(error);
            });
        };
      });
      document.querySelectorAll(".btn-del").forEach((btn) => {
        btn.onclick = function () {
          const linkID = btn.parentElement.getAttribute("data-id");

          fetch("delete_shortLink", {
            method: "POST",
            body: JSON.stringify({ linkID }),
            headers: {
              "content-type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              alert(data.toString());
              displayRows();
            })
            .catch((error) => {
              console.log(error);
            });
        };
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

window.onload = function () {
  displayRows();

  document.getElementById("submit_edit_btn").onclick = function () {
    const linkID = this.getAttribute("data-id");
    const newLink = document.getElementById("editOriginalLink").value;

    if (newLink.length > 0) {
      fetch("edit_shortLink", {
        method: "POST",
        body: JSON.stringify({ linkID, newLink }),
        headers: {
          "content-type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      alert("Nothing to Edit");
    }
  };
};
