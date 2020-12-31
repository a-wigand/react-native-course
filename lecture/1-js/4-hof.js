// Higher Order Functions take funcs as args or return funcs
function map(arr, fn) {
  const newArr = []

  arr.forEach(function(val) {
    newArr.push(fn(val))
  })

  return newArr
}

function addOne(num) { return num + 1 }
function sum(x,y) {return x+y}

const x = [0,1,2,3]

// console.log(map(x, addOne))
// x.forEach(function(val){console.log(val)})
// x.forEach(val => {console.log(val)})

function filter(arr, fn) {
  const newArr = []
  arr.forEach(val => {
    if (fn(val)) newArr.push(val)
  })

  return newArr
}

function reduce(arr, fn, initialVal) {
  let returnVal = initialVal

  arr.forEach(val => {
    returnVal = fn(returnVal, val)
  })

  return returnVal
}

console.log(reduce(x, sum, 0))

