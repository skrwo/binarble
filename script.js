"use strict"
import { WebHaptics } from "https://unpkg.com/web-haptics@0.0.6/dist/index.mjs"

let checked = false
const haptics = new WebHaptics()

window.onload = () => {
    const input = document.getElementById("binary-input")
    if (!input) return console.error("fuck there is no binary-input")

    const task = document.querySelector("div.task span[contenteditable]")
    const n = new URLSearchParams(window.location.search).get("n")
    if (n && !isNaN(n)) task.innerText = parseInt(n)
    else task.innerText = getRandomTask()

    input.oninput = (event) => {
        if (!(new Set(event.data).isSubsetOf(new Set("01"))))
            input.value = input.value.slice(0, input.value.indexOf(event.data))
        checked = false
        updateInputSegments(input.value)
    }
    input.value = ""
    input.focus()
    updateInputSegments(input.value)

    document.querySelector(".input-container")?.addEventListener("click", () => input.focus())

    input.onblur = () => updateInputSegments(input.value, checked ? parseInt(task.innerText) : undefined, true)
    input.onfocus = () => {
        if (!input.readOnly) updateInputSegments(input.value)
    }

    const redo = () => {
        if (!task) return console.error("bruh cannot select the task number")
        checked = false
        input.value = ""
        input.readOnly = false
        updateInputSegments(input.value)
        task.innerText = getRandomTask()
        input.focus()
    }

    document.querySelector(".redo")?.addEventListener("click", redo)

    const check = () => {
        if (!task) return console.error("bruh cannot select the task number")
        input.readOnly = true
        input.focus()
        updateInputSegments(input.value, parseInt(task.innerText))

        // do haptic feedback
        if (!checked) {
            const hapticsFeedbacks = []
            document.querySelectorAll(".input-segment").forEach((segment, index) => {
                const isWrong = segment.classList.contains("wrong")
                hapticsFeedbacks.push({
                    duration: isWrong ? 50 : 30,
                    delay: index > 0 ? 100 : 0,
                    intensity: isWrong ? 1 : 0.25,
                })
            })
            haptics.trigger(hapticsFeedbacks)
        }
        checked = true
    }

    document.querySelector(".check")?.addEventListener("click", check)

    document.onkeydown = (event) => {
        if (event.key === "Enter") check()
        else if (event.key.toLowerCase() === "r" || event.code === "KeyR") redo()
        else if (["ArrowRight", "ArrowLeft"].includes(event.key)) event.preventDefault()
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
    const inputElement = document.getElementById("binary-input")
    let activeSegmentIndex = input.length > 0 ? input.length - 1 : 0
    if (
        activeSegmentIndex >= 0 &&
        activeSegmentIndex < inputElement.maxLength - 1 &&
        input.at(activeSegmentIndex)
    ) activeSegmentIndex++
    segments.forEach((div, index) => {
        div.classList.remove("correct", "wrong")
        if (activeSegmentIndex !== index || removeActive || correctAnswer != undefined) div.classList.remove("active")
        else div.classList.add("active")
        if (index <= input.length - 1) div.innerText = input.at(index)
        else div.innerText = ""
    })
    if (correctAnswer != undefined) {
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