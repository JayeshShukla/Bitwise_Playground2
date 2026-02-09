import React, { useState } from "react";
import "./Component6.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TOPICS = [
  // =========================================================
  // 1. CAST & MIN/MAX
  // =========================================================
  {
    id: "cast_min_max",
    title: "cast & min and max of a type",
    summary: "Type casting and static data types.",
    sections: [
      { type: "subtitle", content: "cast" },
      {
        type: "code",
        code: `x as u32 // <@ without semicolon if written means return this by changing its type
or return x as u32; // <@ explicit return, where above is implicit return`
      },
      { type: "subtitle", content: "min & max" },
      {
        type: "code",
        code: `u8::MAX, u8::MIN // <@ returns the min and max of certian static data type 
u8::MAX as u64 // <@ type casting`
      }
    ]
  },

  // =========================================================
  // 2. FOR LOOP
  // =========================================================
  {
    id: "for_loop",
    title: "for loop",
    summary: "Iterating ranges.",
    sections: [
      { type: "subtitle", content: "for loop" },
      {
        type: "code",
        code: `for i in 0..x // : here i will always be of type usize`
      }
    ]
  },

  // =========================================================
  // 3. IF AND ELSE
  // =========================================================
  {
    id: "if_else",
    title: "if and else",
    summary: "Implicit and explicit returns.",
    sections: [
      { type: "subtitle", content: "if{}else{}" },
      {
        type: "code",
        code: `let x = if conditon1 { 4 } else { return 5;} // <@ if and else can be used to return implicitly or explicitly anything, here even 5 could have been retrned implicilty but to showcase wrtten like this`
      }
    ]
  },

  // =========================================================
  // 4. VECTORS
  // =========================================================
  {
    id: "vectors_main",
    title: "Vector",
    summary: "Static, dynamic, and extensions.",
    sections: [
      { type: "subtitle", content: "vector + inbuilt functions" },
      {
        type: "code",
        code: `let my_vec = vec![1,2,3]; // static vector using MACRO -- a syntax 
let my_vec = vec![];        // dynamic vector 
let v3 = Vec::from([1, 2, 3]); // create a vec from something(here an array due to [])
let v = [].to_vec(); // converts array of [whatever..] in a vector

my_vec.len(); // get length
my_vec.capacity(); // get capacity
my_vec.getAddress(); // not sure if it works need to check 
v.push(5);

v1.extend(v2); // <@ only if v1 is mut, you can kind of join the v2 in it and it will be done, only v1 updates, v2 is still same 
v1.into_iter(); // <@ can convert to iterator if u want`
      },
      { type: "subtitle", content: "mutable + vector" },
      {
        type: "code",
        code: `fn main() {
    let mut v = vec![3,4,5]; 
    let result = modify(v);  // <@ inside the function if uh try to mutate the vec, it will REVERT
    let copy_vec = v.clone(); // <@ but inside the function, you can create a copy and mutate it, but its just a copy, original vec is not being updated at all
}`
      },
      { type: "subtitle", content: "Dereferencing Issues" },
      {
        type: "code",
        code: `let x = vec![1, 2, 3];
let ref_x = &x;
*ref_x // ❌ will revert not possible to dereference a collection like an simple var`
      },
      { type: "subtitle", content: "Comparisons" },
      {
        type: "code",
        code: `    let v1 = vec![1, 2, 3];
    let v3 = vec![3, 2, 1];
    println!("v1 == v3: {}", v1 == v3);  // this will return false cuzz order does matter for vec, but remember if it would have been sets or hashmaps -- order does not matter for them so would have been true`
      }
    ]
  },

  // =========================================================
  // 5. ARRAYS
  // =========================================================
  {
    id: "arrays",
    title: "Arrays",
    summary: "Fixed size collections.",
    sections: [
      { type: "subtitle", content: "Array Basics" },
      {
        type: "code",
        code: `// ALWAYS of fixed size as below diff types of array :
let a: [i32; 3] = [1,2,3];
let a = [true, false, true, false]; // automaically rust is able to know the type
let a : [(usize, bool); 2] = [..not putting here but some values will come]
let a : [Vec<i32>; 10] = [10 vecs upfront will come]
    let board = [[1,2,1],
                 [2,1,2],
                 [1,2,1]]; 
b: [[u8; 3]; 3], // its type is this array of 3 array fixed size all
pub fn accept(a:[bool; 4]) {} // function will take like this argument if passed array
    let mut a = [1,2,3];
    a[0] = 10; // we cannot change the len of an array but can mutate already existing values only if array is mutable`
      },
      { type: "subtitle", content: "Ownership & Iteration" },
      {
        type: "code",
        code: `    let a: [Vec<i32>; 3] = [vec![1, 2], vec![2], vec![3]];
    take(a); // here ownership is transfered to function cuzz array has non-copy types in it, otherwise would not have ownership issue
a.clone() // clones array 
a.iter() // supports all types of iterator
a.into_iter() // only consumes if a has any non-copy types; else it does not
a.into_iter().collect() ❌ // collect does not work on fixed data types at all, like ever, diff methods exist`
      }
    ]
  },

  // =========================================================
  // 6. SLICE
  // =========================================================
  {
    id: "slice",
    title: "slice",
    summary: "Views into contiguous memory.",
    sections: [
      { type: "subtitle", content: "Slice Basics" },
      {
        type: "code",
        code: `    let a = [1, 2, 3, 4];
    let my_full_slice = &a; // A slice in Rust is a reference to array or vector but sliced version
let my_slice = &a[0..2] // slice the a only from index 0 to 1 (2 is excluded) so my_slice = &[1,2]
// it becomes of type &[i32] even if a was vector slice is basicallly an array 

let start_to_index = &s[..index]; // slices from 0 to index-1
let index_to_end = &s[index..] // slices from index to end (complete)
let complet_slice = &s[index1..=index2] // includes the index1 value to the index2 value

 below snippet works fine cuzz above reasons :

fn main() {
    let v = vec![1, 2, 3];
    let arr = [1, 2, 3];

    accept(&v);
    accept(&arr);
}

pub fn accept(_s: &[i32]) {}

s.iter().max() // slices support max() function just remember, max returns Options !
s.to_vec // to_vec is heavily used for slice, string, array to convert into vector == s.iter().copied().collect()`
      },
      { type: "subtitle", content: "Conversion Issues" },
      {
        type: "code",
        code: `vec -> slice -> vec is not a problem 
arr -> slice -> arr is a problem we cnnot just iter.copied().collect to convert slice -> arr`
      }
    ]
  },

  // =========================================================
  // 7. STRING
  // =========================================================
  {
    id: "string",
    title: "String",
    summary: "Literal vs Owned Strings.",
    sections: [
      { type: "subtitle", content: "Basics" },
      {
        type: "code",
        code: `if a == "red" // here red is not owned by anyone but program itself
let b = String::from("red") // red owned by b`
      },
      { type: "subtitle", content: "Types & Comparisons" },
      {
        type: "code",
        code: `let str1 = "BOB"; // this is of &str type to convert into string use .to_string()
let str1 = "BOB".to_string() // now its of type String
    let str1 = "hello";
    let str2 = "hello";
    println!("str1 == str2: {}", str1 == str2); // we can compare using == `
      }
    ]
  },

  // =========================================================
  // 8. STRUCT
  // =========================================================
  {
    id: "struct",
    title: "Struct",
    summary: "Custom data types.",
    sections: [
      { type: "subtitle", content: "Definition & Instantiation" },
      {
        type: "code",
        code: `struct S {
	f: i32; // can you see let keyword is not used, instead its currently private and accessible to same crate, to make it accesible to read via other crates outside main make it pub
}
let s = S { f: 3 }; // normal instanciation and can be now read as s.f 
#[derive(Debug)] // for struct its required to have Debug attribute to inherit the fmt functtion of a predefined trait
distance(point); // if point is a struct instance and passed in a function which is public the struct will just give warning if the struct is in same crate but will give error if in diff crate and trying so need to make the struct as pub as well cuzz function is also pub`
      },
      { type: "subtitle", content: "Destructuring" },
      {
        type: "code",
        code: `pub fn area(Rectangle { upper: (ux, uy), lower: (lx, ly) }: Rectangle) -> u32 // suppose a struct is a struct of tuples this is how one can destructure a struct in the function argument where Rectantct is a struct`
      }
    ]
  },

  // =========================================================
  // 9. ENUM
  // =========================================================
  {
    id: "enum",
    title: "Enum",
    summary: "Enumerations and Macros.",
    sections: [
      { type: "subtitle", content: "Enum Basics" },
      {
        type: "code",
        code: `// EnumName.enum is wrong way isntead EnumName::enum is write eg :
 Color::White // this is how you access a attribute of Color enum 
// if an enum is returned from a \`pub\` fn, the enum has to be also public`
      },
      { type: "subtitle", content: "Issues & Macros Fixes" },
      {
        type: "code",
        code: `TaxiType::Car.clone() ❌ // its not possible to clone an Enum but only possible after adding clone functionlity using \`#[derive(Clone)]\` -- macro
println!("{:?}", Pet::Dog) // ❌ -- due to missing fmt function for enums, we cannot print, but this function can be added to enum's using \`#[derive(Debug)]\`
#[derive(Clone, Copy)] // enums are not by default copy types for obvious reason so we can make it like this of Copy types, remember although Clone just provides .clone funtion its mandatory to make enum of copy types by making it clone type also other wise error

#[derive(PartialEq)] // used in enum so that enum than will be able to use == and  != but how will they start using is like : Enum::a == Enum::b, note here we comparing 2 fields of enum with each other this is the usecase cuzz field == 2 or any other variable can be done without this macro`
      }
    ]
  },

  // =========================================================
  // 10. MACROS
  // =========================================================
  {
    id: "macros",
    title: "Macros",
    summary: "Derive attributes for traits.",
    sections: [
      { type: "subtitle", content: "Common Macros" },
      {
        type: "code",
        code: `#[derive(Clone)] // adds .clone() functionality due to some trait 
#[derive(Debug)] // adds fmt() (internal function), so that println!() can start prinitng enums or struct
#[derive(Debug, Clone)] // now adds both clone() function & fmt() 
#[derive(Clone, Copy)] // makes clone and copy type for ownership concept removal
#[derive(PartialEq)] // used in enum so that enum than will be able to use == and  != but how will they start using is like : Enum::a == Enum::b, note here we comparing 2 fields of enum with each other this is the usecase cuzz field == 2 or any other variable can be done without this macro`
      },
      { type: "subtitle", content: "Anchor + Macros" },
      {
        type: "code",
        code: `#[instruction(poll_id : u64)] // if an account wanna use the passed argument before the function call !
seeds = [b"poll", poll_id.to_le_bytes().as_ref()] // here for eg : the poll_id an argument of a function is used as a seed for #[derive(Accounts)] account`
      }
    ]
  },

  // =========================================================
  // 11. ANCHOR
  // =========================================================
  {
    id: "anchor",
    title: "ANCHOR",
    summary: "Constraint validations and macros.",
    sections: [
      { type: "subtitle", content: "Account Constraints" },
      {
        type: "code",
        code: `#[account(

seeds = b"seedname" // used to check & grab the address derived with seedname, should match the below used state name -- its used if you wanna match at runtime

address = some constant address saved in the program itself before instruction even starts, just like above seeds but is constant -- so no run time just staticly stored in the bytecode of program

has_one = name1 @ name2 // this tells look inside the struct of my with a field name1 which should be equal to name2(a account given in the same instruction)

has_one = name // if both are same


)]`
      }
    ]
  },

  // =========================================================
  // 12. HASHSET
  // =========================================================
  {
    id: "hashset",
    title: "HashSet aka SET",
    summary: "No duplicates, no guaranteed order.",
    sections: [
      { type: "subtitle", content: "HashSet" },
      { type: "note", content: "Note: The order of elements in the HashSet output may vary since HashSets don't guarantee any particular order. looks like {1,2,3} and does not have duplicates" },
      {
        type: "code",
        code: `use std::collections::HashSet;
let mut set = HashSet::new(); // <@ dynamic set creation, needs to be mut if you wanna update it
let mut s1 = HashSet::from([1,2,3]); //  <@ static set

s.insert(10); // insert a value to the set, can take references to value or value itself but should be consistent from then onwards
s.len(); // gives length

s.contains(&10); -> TRUE or FALSE // <@ look how it takes a referance & remember returns a Bool, basically checks if the number 10 is present in it or not ?
&s.contains(&10); // similarly works on the reference to the set as well
s.remove(&10); // <@ remove does not result in an error if you remove a non-existent item.
let set2 = set.clone(); // <@ similarly cloning also works for it

s1.extend(s2); // <@ only if s1 is mut, you can kind of join the s2 in it and it will be done, only s1 updates, s2 is still same 
s.into_iter(); // <@ indexing not supported in set, so conert it to a iterator & with the help of for loop could acces elements`
      },
      { type: "subtitle", content: "Dereferencing Issues" },
      {
        type: "code",
        code: `let x = vec![1, 2, 3]; 
let ref_x = &x;
*ref_x // ❌ will revert not possible to dereference a collection like an simple type`
      },
      { type: "subtitle", content: "Comparisons" },
      {
        type: "code",
        code: `    // Sets (order doesn't matter for sets!)
    let s1 = HashSet::from([1, 2, 3]);
    let s2 = HashSet::from([3, 1, 2]);
    println!("s1 == s2: {}", s1 == s2); `
      }
    ]
  },

  // =========================================================
  // 13. TUPLES
  // =========================================================
  {
    id: "tuples",
    title: "Tuples",
    summary: "Fixed size collection of mixed types.",
    sections: [
      { type: "subtitle", content: "Tuple Basics" },
      {
        type: "code",
        code: `let z: (Vec<i32>, i32, bool) = (vec![-5, 2, 3], 8, true); // different types of data types in single one is a tuple -- Its ALWAYS FIXED in SIDE basically non dynamic 
let y = z; // agian here y will take up the ownership or consume the the vec inside the tuple so a tuple with set, vec or other collection have ownership issues, but a number or bool will not be a problem
z.0 & z.1 etc.. // could be used to access tuples inside data
(x, y, z): (i32, i32, i32); // instead of .0 & .1 we can unpack a tuple as follows
x.clone(); // clone works but only if typle does not have any dynamic collection in it`
      },
      { type: "subtitle", content: "Dereferencing" },
      {
        type: "code",
        code: `let tup = &(1,2) 
*tup  // dereferencing like this works for tuple unless it does not have any collection in it -- lill different collection`
      }
    ]
  },

  // =========================================================
  // 14. OPTIONS (Renamed)
  // =========================================================
  {
    id: "options_inbuilt",
    title: "Options",
    summary: "Handling Some() and None().",
    sections: [
      { type: "subtitle", content: "Common Option Returns" },
      {
        type: "code",
        code: `vec.get(index) // returns Options cuzz can be out of bounds 
hashmap.get(&key) // look how for a hashmap, get takes & reference and returns an Option to value.  else revert if only key is given

.is_none() // to check if something returned none ?
.is_some() // to check if something returned Some ?
.unwrap() // to access the value inside the Some

let variable = Some(any number, or collection) // any thing could be wrappe in an Option usign Some()

let max_val = match a.iter().max() {
    Some(m) => m,
    None => return vec![], // => itself is a return but extra return exists if you wann return from the function this code is it itself !
};`
      }
    ]
  },

  // =========================================================
  // 15. UTILITY FUNCTIONS
  // =========================================================
  {
    id: "utility",
    title: "Utility Functions",
    summary: "Math and helpers.",
    sections: [
      { type: "subtitle", content: "Math" },
      {
        type: "code",
        code: `f32::sqrt(a); // sqrt of a
a.powi(b).  // a^b`
      }
    ]
  },

  // =========================================================
  // 16. HASHMAPS
  // =========================================================
  {
    id: "hashmaps",
    title: "Hashmaps aka maps",
    summary: "Key-value storage.",
    sections: [
      { type: "subtitle", content: "Map Basics" },
      {
        type: "code",
        code: `use std::collections::HashMap;
let mut hm: HashMap<usize, u32> = HashMap::new(); // dynamic map, notice how usize is 
let hm = HashMap::from([(1,2),(2,3),(3,4)]); // from vec of tuple

hm.insert(key, value); // insert to mutable, old key will be replaced incase of dup insertion, can take references to value or value itself but should be consistent from then onwards
hm.get(&key); // will give an Option to Value, expects &key else revert

let map: HashMap<i32, i64> = vec.into_iter().collect(); // a vec can be converted to a hashmap only if that vec is a collection of tuple with exactly 2 elements in a tuple

hm.into_iter(); // similary we can iterat through hashmap
hm.keys(); // returns ITERATOR over REFERENCE to the keys
hm.values(); // returns ITERATOR over REFERENCE to the values`
      },
      { type: "subtitle", content: "Dereferencing Issues" },
      {
        type: "code",
        code: `let x = vec![1, 2, 3]; 
let ref_x = &x;
*ref_x // ❌ will revert not possible to dereference a collection like an simple var`
      },
      { type: "subtitle", content: "Comparisons" },
      {
        type: "code",
        code: `    // HashMaps (order doesn't matter!)
    let m1 = HashMap::from([(3, 4), (1, 2)]);
    let m2 = HashMap::from([(1, 2), (3, 4)]);
    println!("m1 == m2: {}", m1 == m2); `
      }
    ]
  },

  // =========================================================
  // 17. TRAIT & IMPLEMENTATION
  // =========================================================
  {
    id: "trait_impl",
    title: "trait, implimentation",
    summary: "Interfaces and struct logic.",
    sections: [
      { type: "subtitle", content: "Basics" },
      {
        type: "note",
        content: "if struct & trait name is kept same we can omit defining trait & directly write imp struct {} and put the logic"
      },
      {
        type: "note",
        content: "trait -> is like an interface, only function defination, no logic"
      },
      {
        type: "code",
        code: `// as you can see below is its implimenting a trait, differently for both the structs 
imp trait for struct1 {} // here goes the logic1 for struct1 but for same trait
imp trait for struct2 {} // here goes the logic2 for struct2 but for same trait`
      }
    ]
  },

  // =========================================================
  // 18. ITERATOR & RANGES
  // =========================================================
  {
    id: "iterator_ranges",
    title: "Iterator & Ranges",
    summary: "into_iter, collect, ranges and cloning.",
    sections: [
      { type: "subtitle", content: "Iterator Basics" },
      {
        type: "code",
        code: `any_collection.into_iter() // helps collections to be index free, on cost of ownership transfer

<new collection type> = any_collection.into_iter().collect() // iterator.collect() makes any collection of other mentioned collection 
eg : let s: HashSet<i32> = v.into_iter().collect(); or vice versa, basically from any collection to any other`
      },
      { type: "subtitle", content: "Functions that only support Iterators" },
      {
        type: "code",
        code: `let result: i32 = v.into_iter().sum(); // note when used like this sum needs a mentioned type like \`: i32\`, else reverts, it can be removed but in some time in future it needs to be resolved 
.min() & max() // returns an Option cuzz the collection might be empty
.product() // returns product
.nth(0) // Option : can access iterator as index, will output different result for a set as iterator
.count() // gets the len of an iterator`
      },
      { type: "subtitle", content: "consumption" },
      {
        type: "code",
        code: `v.into_iter() // consumes the collection
(&v).into_iter() // saves the collection from being consumed
for i in &v // where v is collection \`== (&v).into_iter();\` under the hood by default using for loop on a collection automatically makes is an iterator
for i in v // will work fine but v will be consumed by into_iter(); which silently works behind the scenes
for e in &v // will yield e of type &i32 cuzz iterator to a ref results in each element as ref

// above was very big and verbose so lets shorten it 
v.iter() == &v(in a for loop) == (&v).into_iter() == (&v).iter(); // and does not consume the collection
// above gives us the reference to the value
but v.into_iter() will consume the vec but give value only`
      },
      { type: "subtitle", content: "References & Copied" },
      {
        type: "code",
        code: `.copied() // &T, Option<&T>, Iterator of &T converted to T, Option<T>, Iterator of T; when called copied on None does not revert
v.into_iter().copied().collect() // converts the collection A to collection Btype but needs a : HashSet<i32> etc type explicitly mentioned
v.iter() == &v).iter() == (&&v).iter() == (&&&v).iter()

Vec<i32>.iter() // iterator of &i32 ill need .copied() to get i32
Vec<&i32>.iter() // iterator of &&i32 will need 2 times .copied() to get i32
Vec<&&i32>.iter() // 3 iterator & 3 copied to get i32`
      },
      { type: "subtitle", content: "Intrestingly" },
      {
        type: "code",
        code: `// Now intrestingly :
Vec<i32>.into_iter() //  iterator of i32
Vec<&i32>.into_iter() // iterator of &i32
Vec<&&i32>.into_iter() // iterator of &&i32

// More intrestingly :
.iter() ignores outer references 
.into_iter() absorbs them and showcase them in the iterator 
eg : &Vec<i32> or &&Vec<i32> or &&&Vec<i32> 
with .iter() will give iterator of <&i32> cuzz it ignores the outer references and the 1 & is coming from its nature of shortcut : (&v).iter() or v.iter()
but for into_iter() will give iterator of &i32, && i32 , &&&i32
into_iter() on &Vec<i32>, &Vec<&i32>, &Vec<&&i32>  will give &i32, &&i32, &&&i32
(&v).iter != &v.iter -- same for into_iter 
cuzz for later we will be producing &Vec<i32>
(&v) == (&&&&&&&&&v)
into_iter absorbs just 1 outer & and rest of it ignores`
      },
      
      { type: "subtitle", content: "Cloning & References" },
      {
        type: "code",
        code: `&Vec<i32> to Vec<i32> // trivial way : v.into_iter().copied().collect() and idomatic way : &Vec<i32>.clone();

let ref_ref_v = &&v; 
// .clone().clone() will revert; 
(*ref_ref_v).clone() // will work; 
// **ref_ref_v will also revert -- it will work for copy types that is i32 etc..`
      },
      
      { type: "subtitle", content: "Ranges" },
      {
        type: "code",
        code: `0..10 // is a Range, cannot be 10..0
for i in 0..10 // behind the scenes gets converted to iterator : for i in (0..10).into_iter() 
let s : HashSet<u32> = (0..10).collect() // since ranges silently gets converted to iterator we can do .collect to get the desired collection 
(0..10).step_by(2) // to get the step jump in range : 0, 2, 4, 6, 8

(0..10).step_by(var as usize)  //  step_by expects datatype to be of usize, by default if you give number it will automatically convert it but, if given a explicit number which is assigned to variable of different data type we need to explicitly convert it to usize 

1..=5 // this range will now run till 5 not 4 
(4..=8).rev() // will run from 10 to 1 also need to check the combo of (8..=4).rev() & (4..=8).rev()`
      },
      { type: "subtitle", content: "Range as a Type" },
      {
        type: "code",
        code: `use std::ops::Range;
let my_range: Range<i32> = 0..10;`
      }
    ]
  },

  // =========================================================
  // 19. OWNERSHIP & CONSUMPTION
  // =========================================================
  {
    id: "ownership_main",
    title: "Ownership & Consumption",
    summary: "The complete guide to moving and borrowing data.",
    sections: [
      { type: "subtitle", content: "1. Ownership Basics" },
      {
        type: "code",
        code: `fn main() {
    let v = vec![1, 2, 3]; // <@ here v variable is the owner of vec![123]
    
    // <@ passing v like this transfers the ownership of v 
    // to the function transferOwnership
    transferOwnership(v); 
    
    // so now after this main would start \`REVERTING\` 
    // if below in main anyone uses it or even mentions it.
    // v is no longer in scope of main()
}

fn transferOwnership(v: Vec<i32>) {
    println!("{:?}", v);
}`
      },
      { type: "note", content: "Once ownership moves, the original variable is invalid in the current scope." },
      
      { type: "subtitle", content: "more ways to consume" },
      {
        type: "code",
        code: `fn main() {    
let v = vec![1, 2, 3];        
let w = v; // <@ w consumed v or ownership of v transferred, so cannot use v anymore
let x = v.into_iter(); // into_iter() consumed v 

}`
      },
      
      { type: "subtitle", content: "3. Avoid Consumption" },
      {
        type: "code",
        label: "Pass by Reference",
        code: `// ANSWER : PASS by REFERENCE
let v = vec![1, 2, 3];
transferOwnership(&v); // <@ pass by reference, does not let func consume the vec
pub fn transferOwnership(v: &Vec<i32>) {}`
      },
      {
        type: "code",
        label: "Reference Assignment",
        code: `let x = vec![1, 2, 3];
let y = &x;     // <@ y is not the consumer or owner of x
let y = x.clone().into_iter() // <@ clone does not let original x to be consumed aka ownership transfer`
      }
    ]
  }
];

const Component6 = () => {
  const [activeView, setActiveView] = useState("grid");
  const [expandedTopic, setExpandedTopic] = useState(null);

  const toggleTopic = (id) => {
    setExpandedTopic(expandedTopic === id ? null : id);
  };

  return (
    <div className="rust-lookup-container">
      {/* --- GRID VIEW --- */}
      {activeView === "grid" && (
        <div className="grid-layout fade-in">
          <h1 className="main-title">Rust Quick Lookup</h1>
          <div className="cards-container">
            {TOPICS.map((topic) => (
              <div 
                key={topic.id}
                className="lookup-card" 
                onClick={() => setActiveView(topic.id)}
              >
                <div className="card-icon">
                   {topic.title.toLowerCase().includes("ownership") ? "🦀" : 
                    topic.title.toLowerCase().includes("vector") ? "📦" :
                    topic.title.toLowerCase().includes("hash") ? "🔑" :
                    topic.title.toLowerCase().includes("loop") ? "🔄" :
                    topic.title.toLowerCase().includes("cast") ? "🔀" :
                    topic.title.toLowerCase().includes("if") ? "❓" : 
                    topic.title.toLowerCase().includes("tuple") ? "🍱" : 
                    topic.title.toLowerCase().includes("option") ? "🤷" : 
                    topic.title.toLowerCase().includes("array") ? "🔢" : 
                    topic.title.toLowerCase().includes("slice") ? "🔪" :
                    topic.title.toLowerCase().includes("string") ? "🧵" :
                    topic.title.toLowerCase().includes("enum") ? "🚥" :
                    topic.title.toLowerCase().includes("macro") ? "🏗️" :
                    topic.title.toLowerCase().includes("struct") ? "🏛️" :
                    topic.title.toLowerCase().includes("utility") ? "🛠️" : 
                    topic.title.toLowerCase().includes("trait") ? "🧩" :
                    topic.title.toLowerCase().includes("anchor") ? "⚓" : "📝"}
                </div>
                <h3>{topic.title}</h3>
                <p>{topic.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- DETAIL VIEW --- */}
      {activeView !== "grid" && (
        <div className="detail-view fade-in">
          <div className="detail-header">
            <button className="back-button" onClick={() => setActiveView("grid")}>
              ← Back
            </button>
            <h2>{TOPICS.find(t => t.id === activeView)?.title}</h2>
          </div>

          <div className="topics-list">
            {TOPICS.filter(t => t.id === activeView).map((topic) => (
              <div key={topic.id} className="topic-item expanded">
                <div className="topic-body">
                    {topic.sections.map((section, index) => (
                      <div key={index} className="section-block">
                        
                        {/* 1. INTERNAL SUBTITLE */}
                        {section.type === "subtitle" && (
                          <h4 className="internal-subtitle">{section.content}</h4>
                        )}

                        {/* 2. TEXT NOTE */}
                        {section.type === "note" && (
                          <div className="topic-text-note">
                            <p>{section.content}</p>
                          </div>
                        )}

                        {/* 3. CODE SNIPPET */}
                        {section.type === "code" && (
                          <div className="code-wrapper">
                            {section.label && <span className="code-label">{section.label}</span>}
                            <div className="topic-code-container">
                              <SyntaxHighlighter 
                                language="rust" 
                                style={vscDarkPlus}
                                showLineNumbers={true}
                                wrapLines={true}
                                customStyle={{
                                  background: 'transparent',
                                  padding: 0,
                                  margin: 0,
                                  fontSize: '0.95rem'
                                }}
                              >
                                {section.code}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Component6;