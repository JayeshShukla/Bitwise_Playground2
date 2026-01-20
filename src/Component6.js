import React, { useState } from "react";
import "./Component6.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
or return x as u32; // <@ explicit return, where above is implicit return`,
      },
      { type: "subtitle", content: "min & max" },
      {
        type: "code",
        code: `u8::MAX, u8::MIN // <@ returns the min and max of certian static data type 
u8::MAX as u64 // <@ type casting`,
      },
    ],
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
        code: `for i in 0..x // : here i will always be of type usize`,
      },
    ],
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
        code: `let x = if conditon1 { 4 } else { return 5;} // <@ if and else can be used to return implicitly or explicitly anything, here even 5 could have been retrned implicilty but to showcase wrtten like this`,
      },
    ],
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

my_vec.len(); // get length
my_vec.capacity(); // get capacity
my_vec.getAddress(); // not sure if it works need to check 
v.push(5);

v1.extend(v2); // <@ only if v1 is mut, you can kind of join the v2 in it and it will be done, only v1 updates, v2 is still same 
v1.into_iter(); // <@ can convert to iterator if u want`,
      },
      { type: "subtitle", content: "mutable + vector" },
      {
        type: "code",
        code: `fn main() {
    let mut v = vec![3,4,5]; 
    let result = modify(v);  // <@ inside the function if uh try to mutate the vec, it will REVERT
    let copy_vec = v.clone(); // <@ but inside the function, you can create a copy and mutate it, but its just a copy, original vec is not being updated at all
}`,
      },
      { type: "subtitle", content: "Dereferencing Issues" },
      {
        type: "code",
        code: `let x = vec![1, 2, 3];
let ref_x = &x;
*ref_x // ❌ will revert not possible to dereference a collection like an simple var`,
      },
    ],
  },

  // =========================================================
  // 5. HASHSET
  // =========================================================
  {
    id: "hashset",
    title: "HashSet aka SET",
    summary: "No duplicates, no guaranteed order.",
    sections: [
      { type: "subtitle", content: "HashSet" },
      {
        type: "note",
        content:
          "Note: The order of elements in the HashSet output may vary since HashSets don't guarantee any particular order. looks like {1,2,3} and does not have duplicates",
      },
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
s.into_iter(); // <@ indexing not supported in set, so conert it to a iterator & with the help of for loop could acces elements`,
      },
      { type: "subtitle", content: "Dereferencing Issues" },
      {
        type: "code",
        code: `let x = vec![1, 2, 3]; 
let ref_x = &x;
*ref_x // ❌ will revert not possible to dereference a collection like an simple type`,
      },
    ],
  },

  // =========================================================
  // 6. TUPLES
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
x.clone(); // clone works but only if typle does not have any dynamic collection in it`,
      },
      { type: "subtitle", content: "Dereferencing" },
      {
        type: "code",
        code: `let tup = &(1,2) 
*tup  // dereferencing like this works for tuple unless it does not have any collection in it -- lill different collection`,
      },
    ],
  },

  // =========================================================
  // 7. INBUILT FUNCTIONS RETURNING OPTIONS
  // =========================================================
  {
    id: "options_inbuilt",
    title: "inbuilt function that returns Options",
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

let variable = Some(any number, or collection) // any thing could be wrappe in an Option usign Some()`,
      },
    ],
  },

  // =========================================================
  // 8. HASHMAPS
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
hm.values(); // returns ITERATOR over REFERENCE to the values`,
      },
      { type: "subtitle", content: "Dereferencing Issues" },
      {
        type: "code",
        code: `let x = vec![1, 2, 3]; 
let ref_x = &x;
*ref_x // ❌ will revert not possible to dereference a collection like an simple var`,
      },
    ],
  },

  // =========================================================
  // 9. ITERATOR & RANGES (Updated with new notes)
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
eg : let s: HashSet<i32> = v.into_iter().collect(); or vice versa, basically from any collection to any other`,
      },
      { type: "subtitle", content: "Functions that only support Iterators" },
      {
        type: "code",
        code: `let result: i32 = v.into_iter().sum(); // note when used like this sum needs a mentioned type like \`: i32\`, else reverts, it can be removed but in some time in future it needs to be resolved 
.min() & max() // returns an Option cuzz the collection might be empty
.product() // returns product
.nth(0) // Option : can access iterator as index, will output different result for a set as iterator
.count() // gets the len of an iterator`,
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
but v.into_iter() will consume the vec but give value only`,
      },
      { type: "subtitle", content: "References & Copied" },
      {
        type: "code",
        code: `.copied() // &T, Option<&T>, Iterator of &T converted to T, Option<T>, Iterator of T; when called copied on None does not revert
v.into_iter().copied().collect() // converts the collection A to collection Btype but needs a : HashSet<i32> etc type explicitly mentioned
v.iter() == &v).iter() == (&&v).iter() == (&&&v).iter()

Vec<i32>.iter() // iterator of &i32 ill need .copied() to get i32
Vec<&i32>.iter() // iterator of &&i32 will need 2 times .copied() to get i32
Vec<&&i32>.iter() // 3 iterator & 3 copied to get i32`,
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
into_iter absorbs just 1 outer & and rest of it ignores`,
      },

      /* --- NEW SECTION: Cloning & Dereferencing --- */
      { type: "subtitle", content: "Cloning & References" },
      {
        type: "code",
        code: `&Vec<i32> to Vec<i32> // trivial way : v.into_iter().copied().collect() and idomatic way : &Vec<i32>.clone();

let ref_ref_v = &&v; 
// .clone().clone() will revert; 
(*ref_ref_v).clone() // will work; 
// **ref_ref_v will also revert -- it will work for copy types that is i32 etc..`,
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
(4..=8).rev() // will run from 10 to 1 also need to check the combo of (8..=4).rev() & (4..=8).rev()`,
      },
      { type: "subtitle", content: "Range as a Type" },
      {
        type: "code",
        code: `use std::ops::Range;
let my_range: Range<i32> = 0..10;`,
      },
    ],
  },

  // =========================================================
  // 10. OWNERSHIP & CONSUMPTION
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
}`,
      },
      {
        type: "note",
        content:
          "Once ownership moves, the original variable is invalid in the current scope.",
      },

      { type: "subtitle", content: "more ways to consume" },
      {
        type: "code",
        code: `fn main() {    
let v = vec![1, 2, 3];        
let w = v; // <@ w consumed v or ownership of v transferred, so cannot use v anymore
let x = v.into_iter(); // into_iter() consumed v 

}`,
      },

      { type: "subtitle", content: "3. Avoid Consumption" },
      {
        type: "code",
        label: "Pass by Reference",
        code: `// ANSWER : PASS by REFERENCE
let v = vec![1, 2, 3];
transferOwnership(&v); // <@ pass by reference, does not let func consume the vec
pub fn transferOwnership(v: &Vec<i32>) {}`,
      },
      {
        type: "code",
        label: "Reference Assignment",
        code: `let x = vec![1, 2, 3];
let y = &x;     // <@ y is not the consumer or owner of x
let y = x.clone().into_iter() // <@ clone does not let original x to be consumed aka ownership transfer`,
      },
    ],
  },
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
                  {topic.title.toLowerCase().includes("ownership")
                    ? "🦀"
                    : topic.title.toLowerCase().includes("vector")
                    ? "📦"
                    : topic.title.toLowerCase().includes("hash")
                    ? "🔑"
                    : topic.title.toLowerCase().includes("loop")
                    ? "🔄"
                    : topic.title.toLowerCase().includes("cast")
                    ? "🔀"
                    : topic.title.toLowerCase().includes("if")
                    ? "❓"
                    : topic.title.toLowerCase().includes("tuple")
                    ? "🍱"
                    : topic.title.toLowerCase().includes("option")
                    ? "🤷"
                    : "📝"}
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
            <button
              className="back-button"
              onClick={() => setActiveView("grid")}
            >
              ← Back
            </button>
            <h2>{TOPICS.find((t) => t.id === activeView)?.title}</h2>
          </div>

          <div className="topics-list">
            {TOPICS.filter((t) => t.id === activeView).map((topic) => (
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
                          {section.label && (
                            <span className="code-label">{section.label}</span>
                          )}
                          <div className="topic-code-container">
                            <SyntaxHighlighter
                              language="rust"
                              style={vscDarkPlus}
                              showLineNumbers={true}
                              wrapLines={true}
                              customStyle={{
                                background: "transparent",
                                padding: 0,
                                margin: 0,
                                fontSize: "0.95rem",
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
