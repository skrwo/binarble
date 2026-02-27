window.onload = () => {
    const input = document.getElementById("binary-input");
    if (!input) return console.error("fuck there is no binary-input");

    const task = document.querySelector("div.task span[contenteditable]");
    const n = new URLSearchParams(window.location.search).get("n")
    if (n && !isNaN(n)) task.innerText = parseInt(n)
    else task.innerText = getRandomTask()
    
    input.oninput = (event) => {
        console.log(event)
        if (!(new Set(event.data).isSubsetOf(new Set(["0", "1"]))))
            input.value = input.value.slice(0, input.value.indexOf(event.data))
        updateInputSegments(input.value)
    }
    input.value = "";
    input.focus();
    updateInputSegments(input.value);

    document.querySelector(".input-container")?.addEventListener("click", () => input.focus());
    
    input.onblur = () => updateInputSegments(input.value, undefined, true);
    input.onfocus = () => updateInputSegments(input.value);

    document.querySelector(".redo")?.addEventListener("click", () => {
        if (!task) return console.error("bruh cannot select the task number")
        input.value = ""
        updateInputSegments(input.value)
        task.innerText = getRandomTask()
        input.focus()
    })

    const check = () => {
        if (!task) return console.error("bruh cannot select the task number")
        input.focus()
        updateInputSegments(input.value, parseInt(task.innerText))
    }

    document.querySelector(".check")?.addEventListener("click", check)

    document.onkeydown = (event) => {
        if (event.key === "Enter") check()
        else if (["ArrowRight","ArrowLeft"].includes(event.key)) event.preventDefault() 
    }
}
/**
 * Updates styles and data for the input segments
 * @param {string} input 
 * @param {number | undefined} correctAnswer
 * @param {boolean} removeActive
 */
function updateInputSegments(input, correctAnswer, removeActive = false) {
    const segments = document.querySelectorAll(".input-segment")
    let activeSegmentIndex = input.length > 0 ? input.length - 1 : 0
    if (activeSegmentIndex >= 0 && input.at(activeSegmentIndex)) activeSegmentIndex++
    segments.forEach((div, index) => {
        div.classList.remove("correct", "wrong")
        if (activeSegmentIndex !== index || removeActive) div.classList.remove("active")
        else div.classList.add("active")
        if (index <= input.length - 1) div.innerText = input.at(index)
        else div.innerText = ""
    })
    if (correctAnswer) {
        const correctText = correctAnswer.toString(2).padStart(6, "0")
        segments.forEach((div, index) => {
            if ((input.at(index) ?? "0") !== correctText.at(index)) div.classList.add("wrong")
            else div.classList.add("correct")
        })
    }
}

/**
 * Get next random task number
 * @returns {number}
 */
function getRandomTask() {
    return Math.floor(Math.random() * 63)
}