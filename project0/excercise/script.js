const classNames = {
  TODO_ITEM: 'todo-container',
  TODO_CHECKBOX: 'todo-checkbox',
  TODO_TEXT: 'todo-text',
  TODO_DELETE: 'todo-delete',
}

const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')

function newTodo() {
  item = document.createElement('li')
  item.classList.add(classNames.TODO_ITEM)
  closeButton = document.createElement('button')
  closeButton.onclick = removeTodo
  closeButton.textContent = 'DONE'
  closeButton.classList.add(classNames.TODO_CHECKBOX)
  text = document.createElement('span')
  text.textContent = prompt('Add To Do item:')
  item.appendChild(closeButton)
  item.appendChild(text)
  list.appendChild(item)
  itemCountSpan.textContent = parseInt(itemCountSpan.textContent) + 1
}

function removeTodo(item) {
  this.parentElement.remove()
}