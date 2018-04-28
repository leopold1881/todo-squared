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
    for ( let i = 0; i < ID_LENGTH; i++ ) {
      rtn += ALPHABET.charAt( Math.floor( Math.random() * ALPHABET.length ) );
      if ( i === 2 || i === 5 ) {
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
  constructor( text, parent ) {
    this.id = utils.generateID();
    this.parent = parent || '$root';
    this.text = text;
    this.completed = false;
    this.dateCreated = new Date();
    this.subTodo = null;
  }

  edit( text ) {
    this.text = text;
    this.dateModified = new Date();
  }
}

let inDevelopment = {};

let model = new TodoList();

let controller = {
  editTodo: ( todoList, text, newText ) => {
    return ( function editIn( array ) {
      array.forEach( function ( currentTodo ) {
        //base case
        if ( currentTodo.text === text ) {
          currentTodo.edit( newText );
          return `"${ text }" was edited to "${ newText }"`;
          return;
        }
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          return editIn( currentTodo.subTodo );
        }
      } );
    } )( todoList );
  },
  //TO ADD: find multiple matching todo texts if exist
  //USE CASE: controller.findTodo(model.$root, 'find this todo');
  findTodo: ( todoList, text ) => {
    let foundTodo;
    return ( function findIn( array ) {
      array.forEach( function ( currentTodo ) {
        //base case
        if ( currentTodo.text === text ) {
          foundTodo = currentTodo;
          return;
        }
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          return findIn( currentTodo.subTodo );
        }
      } );
      return foundTodo;
    } )( todoList );
  },
  //USE CASE: controller.findTodo(model.$root, 'find this todo');
  insertTodo: ( todoList, text, parent ) => {
    if ( parent ) {
      return ( function insertIn( array ) {
        array.forEach( function ( currentTodo ) {
          //base case
          if ( currentTodo.text === parent ) {
            //if no array, initialise array
            if ( currentTodo.subTodo === null ) {
              currentTodo.subTodo = [];
            }
            currentTodo.subTodo.push( new Todo( text, parent ) );
            return `"${ text }" was inserted at "${ parent }"`;
            //NB: does return stop for each?
            return;
          }
          //recursive case
          if ( currentTodo.subTodo !== null ) {
            return insertIn( currentTodo.subTodo );
          }
        } );
      } )( todoList );
    } else {
      todoList.push( new Todo( text ) );
      return `"${ text }" was inserted at $root`;
    }
  },
  deleteTodo: ( todoList, text ) => {

    /**
     * deletes root level
     * deletes to one level of depth
     * 
     * deleting prototype... deletes get some interviews (previous depth)
     * deleteing complete BYOA... deletes get some interviews
     * deleting master vue.js... deletes get sme interviews
     *    rule: if deleting 2nd depth with previous third depth, it will delete the third depth in error
     *    problem: previousTodo will always store the last todo to have subtodos, so when recursing back up the tree, the 2nd depth todo has its previousTodo pointing to the previous 2nd depth todo, and not its own parent. 
     */

    let ancestors = [];
    return ( function deleteIn( array ) {
      array.forEach( function ( currentTodo ) {
        //base case
        if ( currentTodo.text === text ) {

          if ( currentTodo.parent === '$root' ) {
            let index = array.indexOf( currentTodo );
            array.splice( index, 1 );
          } else {
            let lastPrevious = ancestors[ ancestors.length - 1 ];
            // let index = previousTodo.subTodo.indexOf( currentTodo );
            let index = lastPrevious.subTodo.indexOf( currentTodo );
            // previousTodo.subTodo.splice( index, 1 );
            lastPrevious.subTodo.splice( index, 1 );
            //if no previous todo (ie currently at $root)
          }

          //concise logic
          // let targetArray = currentTodo.parent === '$root' ? array : previousTodo.subTodo;
          // targetArray.splice(targetArray.indexOf(currentTodo), 1);

          return null;
        }
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          //store previous todo for deletion
          // previousTodo = currentTodo;
          ancestors.push( currentTodo );
          return deleteIn( currentTodo.subTodo );
        }
      } );
      ancestors.pop();
    } )( todoList );
  },
  toggleTodo: ( todoList, text ) => {
    return ( function toggleIn( array ) {
      array.forEach( function ( currentTodo ) {
        //base case
        if ( currentTodo.text === text ) {
          currentTodo.completed = !currentTodo.completed;
          let shouldToggle = currentTodo.completed;
          //toggle children recursive case
          if ( currentTodo.subTodo !== null ) {
            ( function toggleAllChildren( child ) {
              child.forEach( function ( currentChild ) {
                currentChild.completed = shouldToggle;
                if ( currentChild.subTodo !== null ) {
                  toggleAllChildren( currentChild.subTodo );
                }
              } );
            } )( currentTodo.subTodo );
          }
          return;
        }
        //single nested recursive case
        if ( currentTodo.subTodo !== null ) {
          return toggleIn( currentTodo.subTodo );
        }
      } );
    } )( todoList );
  },
  toggleAll: todoList => {
    //use 'every' to determine if all todos are toggled
    let areAllToggled = ( function findIncompleteTodo( array ) {
      return array.every( function ( currentTodo ) {
        //base case
        //if even one of the todos is not complete, set areAllToggled to false
        if ( currentTodo.completed === false ) return false;
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          findIncompleteTodo( currentTodo.subTodo );
          return true;
        }
      } );
    } )( todoList );

    //use 'forEach' to set all todos to either complete or non-complete
    ( function toggleAllIn( array ) {
      array.forEach( function ( currentTodo ) {
        //base case
        currentTodo.completed = !areAllToggled;
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          return toggleAllIn( currentTodo.subTodo );
        }
      } );
    } )( todoList );
  },
  totalTodos: todoList => {
    let counter = 0;
    return ( function countIn( array ) {
      array.forEach( function ( currentTodo ) {
        counter++;
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          return countIn( currentTodo.subTodo );
        }
        //base case
        return;
      } );
      return counter;
    } )( todoList );
  }
};

let view = {
  consoleRender: todoList => {
    console.log( `\nTodoList: ${ controller.totalTodos( todoList ) } item(s).\n \n` );
    let indentation = 0;
    ( function print( array ) {
      array.forEach( function ( currentTodo, index ) {
        let spaces = '';
        let completedMark = '( )';
        for ( let i = 1; i <= indentation; i++ ) {
          spaces += '     ';
        }
        if ( currentTodo.completed === true ) {
          completedMark = '(x)';
        }
        console.log(
          `${ completedMark }${ spaces } ${ index + 1 } ${ currentTodo.text }`
        );
        //recursive case
        if ( currentTodo.subTodo !== null ) {
          indentation++;
          return print( currentTodo.subTodo );
        }
        return;
      } );
      indentation--;
    } )( todoList );
  },
  render: () => {
    //grab master todo list and create container div
    let app = document.getElementById( 'app' );
    let todoContainer = view.constructContainer();

    //allocate memory for construction of HTML
    let virtualDOM = view.constructTodoList();

    //copy virtualDOM to hold position in recursion (for readability)
    let currentContainer = virtualDOM;
    let previousTodo;

    ( function constructDOM( fromArray ) {
      fromArray.forEach( function ( currentTodo ) {
        let v = virtualDOM;

        //check for root depth to over-ride step by step depth finding
        if ( currentTodo.parent === '$root' ) {
          currentContainer = virtualDOM;
        }

        view.insertTodo( currentTodo.text, currentTodo.id, currentContainer );

        //base case
        if ( currentTodo.subTodo === null ) {
          //move container pointer up one level to accommodate further todos at this depth
          //use if to prevent moving up level at $root node
          if ( currentContainer.parentNode !== null ) {
            //if SOMETHING, don't move pointer up

            //step-by-step depth finding
            if ( previousTodo.parent === currentTodo.parent ) {
              currentContainer = currentContainer;
            } else if ( previousTodo.text === currentTodo.parent ) {
              currentContainer = currentContainer;
            } else {
              currentContainer = currentContainer.parentNode;
            }
          }

          //recursive case
        } else {

          let newSubContainer = view.constructSubTodoList();
          view.placeInside( newSubContainer, currentContainer );

          //move container pointer down one level to accommodate recursion
          currentContainer = currentContainer.lastChild;

          //store pointer to this todo and traverse into subTodos
          previousTodo = currentTodo;
          return constructDOM( currentTodo.subTodo );
        }

      } );

    } )( model.$root );

    console.log( app );
    view.placeInside( virtualDOM, todoContainer );
    view.placeInside( todoContainer, app );
  },
  constructContainer: () => {
    //create container div for app
    let todoContainer = document.createElement( 'div' );
    todoContainer.className = 'todoContainer';

    //create div to contain header elements
    let header = document.createElement( 'div' );
    header.id = 'header';

    let toggleAllIcon = document.createElement( 'i' );
    toggleAllIcon.className = 'fas fa-angle-down fa-2x toggle-all';
    header.appendChild( toggleAllIcon );

    let input = document.createElement( 'input' );
    input.id = 'enter';
    input.placeholder = 'What would you like todo?';
    header.appendChild( input );

    let addTodoButton = document.createElement( 'button' );
    addTodoButton.id = 'add-todo';
    addTodoButton.textContent = 'Add Todo';
    header.appendChild( addTodoButton );

    todoContainer.appendChild( header );
    return todoContainer;
  },
  constructTodoComponent: ( text, id ) => {
    //create todo div to create consistent todo styling
    let todoLI = document.createElement( 'li' );
    todoLI.className = 'todo';
    todoLI.dataset.id = id;

    let todoText = document.createElement( 'div' );
    todoText.className = 'todo-text';

    //create checkbox and insert it into todo-text div
    let toggleCheckbox = document.createElement( 'input' );
    toggleCheckbox.type = 'checkbox';
    toggleCheckbox.id = 'toggle';
    todoText.appendChild( toggleCheckbox );

    //create todo text label and insert it into todo-text div
    let todo = document.createElement( 'label' );
    //HACK: unknown cause of label text closer to checkbox when created through model function
    todo.textContent = ' ' + text;
    todoText.appendChild( todo );

    //insert compound todo-text div into parent todo div
    todoLI.appendChild( todoText );

    //create destroy button and insert it into parent todo div
    let destroyButton = document.createElement( 'button' );
    destroyButton.className = 'destroy';
    destroyButton.textContent = 'x';
    todoLI.appendChild( destroyButton );

    return todoLI;
  },
  constructTodoList: () => {
    let todoList = document.createElement( 'ul' );
    todoList.className = 'todo-list';
    return todoList;
  },
  constructSubTodoList: () => {
    let subTodoList = document.createElement( 'ul' );
    subTodoList.className = 'sub-todo-list';
    return subTodoList;
  },
  insertTodo: ( text, id, parent_node ) => {
    let newTodo = view.constructTodoComponent( text, id );
    parent_node.insertAdjacentElement( 'beforeend', newTodo );
  },
  placeInside: ( child_node, parent_node ) => {
    parent_node.insertAdjacentElement( 'beforeend', child_node );
  }
};

/*
if (node.parentNode) {
  // remove a node from the tree, unless
  // it's not in the tree already
  node.parentNode.removeChild(node);
}
*/


