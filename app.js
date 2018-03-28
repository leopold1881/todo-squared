/*
Todo List:
1. Escape the console
*/

// =================================
//        escape the console
// =================================

let utils = {
  generateID: function () {
    const ALPHABET =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const ID_LENGTH = 8;
    let rtn = '';
    for (let i = 0; i < ID_LENGTH; i++) {
      rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
      if (i === 2 || i === 5) {
        rtn += '-';
      }
    }
    return rtn;
  }
};

class TodoList {
  constructor() {
    this.$root = [];
  }
}

class Todo {
  constructor(text, parent) {
    this.id = utils.generateID();
    this.parent = parent || '$root';
    this.text = text;
    this.completed = false;
    this.dateCreated = new Date();
    this.subTodo = null;
  }

  edit(text) {
    this.text = text;
    this.dateModified = new Date();
  }
}

let inDevelopment = {};

let model = new TodoList();

let view = {
  consoleRender: todoList => {
    console.log(`\nTodoList: ${controller.totalTodos(todoList)} item(s).\n \n`);
    let indentation = 0;
    (function print(array) {
      array.forEach(function (currentTodo, index) {
        let spaces = '';
        let completedMark = '( )';
        for (let i = 1; i <= indentation; i++) {
          spaces += '     ';
        }
        if (currentTodo.completed === true) {
          completedMark = '(x)';
        }
        console.log(
          `${completedMark}${spaces} ${index + 1} ${currentTodo.text}`
        );
        //recursive case
        if (currentTodo.subTodo !== null) {
          indentation++;
          return print(currentTodo.subTodo);
        }
        return;
      });
      indentation--;
    })(todoList);
  },
  render: () => { }
};

let controller = {
  editTodo: (todoList, text, newText) => {
    return (function editIn(array) {
      array.forEach(function (currentTodo) {
        //base case
        if (currentTodo.text === text) {
          currentTodo.edit(newText);
          return `"${text}" was edited to "${newText}"`;
          return;
        }
        //recursive case
        if (currentTodo.subTodo !== null) {
          return editIn(currentTodo.subTodo);
        }
      });
    })(todoList);
  },
  //TO ADD: find multiple matching todo texts if exist
  //USE CASE: controller.findTodo(model.$root, 'find this todo');
  findTodo: (todoList, text) => {
    let foundTodo;
    return (function findIn(array) {
      array.forEach(function (currentTodo) {
        //base case
        if (currentTodo.text === text) {
          foundTodo = currentTodo;
          return;
        }
        //recursive case
        if (currentTodo.subTodo !== null) {
          return findIn(currentTodo.subTodo);
        }
      });
      return foundTodo;
    })(todoList);
  },
  //USE CASE: controller.findTodo(model.$root, 'find this todo');
  insertTodo: (todoList, text, parent) => {
    if (parent) {
      return (function insertIn(array) {
        array.forEach(function (currentTodo) {
          //base case
          if (currentTodo.text === parent) {
            //if no array, initialise array
            if (currentTodo.subTodo === null) {
              currentTodo.subTodo = [];
            }
            currentTodo.subTodo.push(new Todo(text, parent));
            return `"${text}" was inserted at "${parent}"`;
            //NB: does return stop for each?
            return;
          }
          //recursive case
          if (currentTodo.subTodo !== null) {
            return insertIn(currentTodo.subTodo);
          }
        });
      })(todoList);
    } else {
      todoList.push(new Todo(text));
      return `"${text}" was inserted at $root`;
    }
  },
  deleteTodo: (todoList, text) => {
    let previousTodo;
    return (function deleteIn(array) {
      array.forEach(function (currentTodo) {
        //base case
        if (currentTodo.text === text) {
          if (previousTodo) {
            let index = previousTodo.subTodo.indexOf(currentTodo);
            previousTodo.subTodo.splice(index, 1);
            //if no previous todo (ie currently at $root)
          } else {
            let index = array.indexOf(currentTodo);
            array.splice(index, 1);
            return `"${text}" was deleted`;
          }
          return;
        }
        //recursive case
        if (currentTodo.subTodo !== null) {
          //store previous todo for deletion
          previousTodo = currentTodo;
          return deleteIn(currentTodo.subTodo);
        }
      });
    })(todoList);
  },
  toggleTodo: (todoList, text) => {
    return (function toggleIn(array) {
      array.forEach(function (currentTodo) {
        //base case
        if (currentTodo.text === text) {
          currentTodo.completed = !currentTodo.completed;
          let shouldToggle = currentTodo.completed;
          //toggle children recursive case
          if (currentTodo.subTodo !== null) {
            (function toggleAllChildren(child) {
              child.forEach(function (currentChild) {
                currentChild.completed = shouldToggle;
                if (currentChild.subTodo !== null) {
                  toggleAllChildren(currentChild.subTodo);
                }
              });
            })(currentTodo.subTodo);
          }
          return;
        }
        //single nested recursive case
        if (currentTodo.subTodo !== null) {
          return toggleIn(currentTodo.subTodo);
        }
      });
    })(todoList);
  },
  toggleAll: todoList => {
    //use 'every' to determine if all todos are toggled
    let areAllToggled = (function findIncompleteTodo(array) {
      return array.every(function (currentTodo) {
        //base case
        //if even one of the todos is not complete, set areAllToggled to false
        if (currentTodo.completed === false) return false;
        //recursive case
        if (currentTodo.subTodo !== null) {
          findIncompleteTodo(currentTodo.subTodo);
          return true;
        }
      });
    })(todoList);

    //use 'forEach' to set all todos to either complete or non-complete
    (function toggleAllIn(array) {
      array.forEach(function (currentTodo) {
        //base case
        currentTodo.completed = !areAllToggled;
        //recursive case
        if (currentTodo.subTodo !== null) {
          return toggleAllIn(currentTodo.subTodo);
        }
      });
    })(todoList);
  },
  totalTodos: todoList => {
    let counter = 0;
    return (function countIn(array) {
      array.forEach(function (currentTodo) {
        counter++;
        //recursive case
        if (currentTodo.subTodo !== null) {
          return countIn(currentTodo.subTodo);
        }
        //base case
        return;
      });
      return counter;
    })(todoList);
  }
};

/*********************************************
 *          UNDER CONSTRUCTION *
 ********************************************/

function constructContainer() {
  //create container div for app
  let todoContainer = document.createElement('div');
  todoContainer.className = 'todoContainer';

  //create div to contain header elements
  let header = document.createElement('div');
  header.id = 'header';

  let toggleAllIcon = document.createElement('i');
  toggleAllIcon.className = 'fas fa-angle-down fa-2x toggle-all';
  header.appendChild(toggleAllIcon);

  let input = document.createElement('input');
  input.id = 'enter';
  input.placeholder = 'What would you like todo?';
  header.appendChild(input);

  let addTodoButton = document.createElement('button');
  addTodoButton.id = 'add-todo';
  addTodoButton.textContent = 'Add Todo';
  header.appendChild(addTodoButton);

  todoContainer.appendChild(header);
  return todoContainer;
}

function constructTodoComponent(text) {
  //create todo div to create consistent todo styling
  let todoLI = document.createElement('li');
  todoLI.className = 'todo';

  let todoText = document.createElement('div');
  todoText.className = 'todo-text';

  //create checkbox and insert it into todo-text div
  let toggleCheckbox = document.createElement('input');
  toggleCheckbox.type = 'checkbox';
  toggleCheckbox.id = 'toggle';
  todoText.appendChild(toggleCheckbox);

  //create todo text label and insert it into todo-text div
  let todo = document.createElement('label');
  //HACK: unknown cause of label text closer to checkbox when created through model function
  todo.textContent = ' ' + text;
  todoText.appendChild(todo);

  //insert compound todo-text div into parent todo div
  todoLI.appendChild(todoText);

  //create destroy button and insert it into parent todo div
  let destroyButton = document.createElement('button');
  destroyButton.className = 'destroy';
  destroyButton.textContent = 'x';
  todoLI.appendChild(destroyButton);

  return todoLI;
}

function constructTodoList() {
  let todoList = document.createElement('ul');
  todoList.className = 'todo-list';
  return todoList;
}

function constructSubTodoList() {
  let subTodoList = document.createElement('ul');
  subTodoList.className = 'sub-todo-list';
  return subTodoList;
}

function insertTodo(text, parent_node) {
  let newTodo = constructTodoComponent(text);
  parent_node.insertAdjacentElement('beforeend', newTodo);
}

function placeInside(child_node, parent_node) {
  parent_node.insertAdjacentElement('beforeend', child_node);
}

function mockDOM() {
  //grab master todo list and create container div
  let app = document.getElementById('app');
  let todoContainer = constructContainer();

  let helloWorldList = constructTodoList();
  insertTodo('Hello, from JavaScript!', helloWorldList);

  let helloWorldSubList = constructSubTodoList();
  insertTodo('Create DOM component constructors', helloWorldSubList);
  insertTodo('Find method to nest these', helloWorldSubList);
  insertTodo('Weave into recursive displayTodos', helloWorldSubList);

  placeInside(helloWorldSubList, helloWorldList);

  let recursionSubList = constructSubTodoList();
  insertTodo('compelete construction inner API', recursionSubList);
  insertTodo('migrate into TodoList.prototype.render', recursionSubList);
  insertTodo('construct tests', recursionSubList);

  placeInside(recursionSubList, helloWorldSubList);

  placeInside(helloWorldList, todoContainer);

  placeInside(todoContainer, app);
}

inDevelopment.render = function () {
  //grab master todo list and create container div
  let app = document.getElementById('app');

  let todoContainer = constructContainer();
  let virtualDOM = constructTodoList();

  //issue:'Root 1 - Sub 2' needs to escape its parent sub-todo-list, and be placed in the parent of this list
    //ideally, this needs to be dynamic,  - can we calculate number of parents recursively? Do we even need to?

  function findNode(nodeList) {
      array.forEach(function (currentTodo) {
        //base case
        if (currentTodo.text === text) {
          foundTodo = currentTodo;
          return;
        }
        //recursive case
        if (currentTodo.subTodo !== null) {
          return findIn(currentTodo.subTodo);
        }
      });
      return foundTodo;
    };

  (function constructDOM(fromArray, subTodoContainer) {
    // let previousElement;

    fromArray.forEach(function (currentTodo, index) {
      //base case
      function calculateDepth() {
        //if virtualDOM is populated, work out its current length of children NodeList
        let lastChildElement = virtualDOM.lastChild;
        let lengthOfChildren;
        if(lastChildElement){
          lengthOfChildren = lastChildElement.children.length
        }

        //prevent error when no lastChild on first iteration of constructDOM, setting position to top level
        if (lastChildElement === null && virtualDOM.children.length === 0) {
          //??
          return virtualDOM;
        }

        //ensure that elements with the parent of $root set position to top level
        if (lastChildElement !== null && currentTodo.parent === '$root') {
          //reset location to top level
          return virtualDOM;
        }

        //in all other cases
        let positionToInsert = 0;
        if(lengthOfChildren) {
          positionToInsert = lengthOfChildren - 1;
          return lastChildElement.children[positionToInsert];
        } else {
          return lastChildElement;
        }

        
      }

      let atThisLocation = calculateDepth();
      insertTodo(currentTodo.text, atThisLocation);

      //recursive case
      if (currentTodo.subTodo !== null) {

        if(currentTodo.parent === '$root') {
          let newSubContainer = constructSubTodoList();
          placeInside(newSubContainer, virtualDOM);
        } else {
          let newSubContainer = constructSubTodoList();
          placeInside(newSubContainer, virtualDOM.lastChild);
        }

        return constructDOM(currentTodo.subTodo);

        //create new sub-todo-list container and place inside the virtualDOM
        // let newSubContainer = constructSubTodoList();
        // placeInside(newSubContainer, virtualDOM);
        // return constructDOM(currentTodo.subTodo);
      }
    });
  })(model.$root);

  console.log(app);
  placeInside(virtualDOM, todoContainer);
  placeInside(todoContainer, app);
};

/*
if (node.parentNode) {
  // remove a node from the tree, unless
  // it's not in the tree already
  node.parentNode.removeChild(node);
}
*/

/*********************************************
 *          UNDER CONSTRUCTION *
 ********************************************/

//feed example data to browser console
// controller.insertTodo(model.$root, 'Master watchandcode');
// controller.insertTodo(model.$root, 'Become a Javascript ninja');
// controller.insertTodo(model.$root, 'Overthrow Gordon');
// controller.insertTodo(
//   model.$root,
//   'Roll up him in a yoga mat',
//   'Overthrow Gordon'
// );
// controller.insertTodo(
//   model.$root,
//   'consider reviewing some videos',
//   'Master watchandcode'
// );
// controller.insertTodo(
//   model.$root,
//   'get a javascript developer job',
//   'Become a Javascript ninja'
// );
// controller.insertTodo(
//   model.$root,
//   'prototype nested todo list',
//   'Become a Javascript ninja'
// );
// controller.insertTodo(
//   model.$root,
//   'complete BYOA',
//   'Become a Javascript ninja'
// );
// controller.insertTodo(
//   model.$root,
//   'master vue.js',
//   'Become a Javascript ninja'
// );
// controller.insertTodo(model.$root, 'complete tutorial', 'master vue.js');
// controller.insertTodo(model.$root, 'read documentation', 'master vue.js');
// controller.insertTodo(model.$root, 'implement TodoSquared', 'master vue.js');
// controller.insertTodo(
//   model.$root,
//   'build a robust web app',
//   'get a javascript developer job'
// );
// controller.toggleTodo(model.$root, 'prototype nested todo list');
// controller.toggleTodo(model.$root, 'read documentation');

controller.insertTodo(model.$root, 'Root 1');
controller.insertTodo(model.$root, 'Root 2');
controller.insertTodo(model.$root, 'Root 3');
controller.insertTodo(model.$root, 'Root 1 - Sub 1', 'Root 1');
controller.insertTodo(model.$root, 'Sub 1 - Sub 1', 'Root 1 - Sub 1');
controller.insertTodo(model.$root, 'Root 1 - Sub 2', 'Root 1');

console.log(model.$root);
view.consoleRender(model.$root);
inDevelopment.render(model.$root);