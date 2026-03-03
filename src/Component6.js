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
}
v.remove(i) // removes the vector's index but remember that if the v is being iteratored and you already have a reference or mut reference of vec, than it will result in an error as already have a mut reference and try to mutate it using remove()`
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
s.to_vec // to_vec is heavily used for slice, string, array to convert into vector == s.iter().copied().collect()

 let v = vec![1,2,3];
&v[..] // this is how a vec is now converted to a slice with full elements of vec`
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

owner = xyz // makes sure the below passed accounts.owner field is xyz

#[instruction(amount: u32)] // amount must be passed as an instruction
...
constraint = (from.points) >= amount @ Errors::InsufficientPoints // literally moving the check of instruction to this instruction Struct to update, just like has_one which can be checked using ctx inside the instructions
from: Account<'info, Player>,

// how to check if field is a Vec like : pub auths: Vec<Pubkey>
constraint = struct_account.auths.contains(&signer.key()) @ ErrorCodes::whateverError
)]`
      },
      { type: "subtitle", content: "Account Types" },
      {
        type: "code",
        code: `InterfaceAccount<'info, T> // account owned by another program like Spl or tokne22 with data T
Interface<'info, T> // **executable** program itself
Interface<'info, TokenInterface>, // checks if the address provided matches a specific whitelist of allowed programs that is old or new SPL Token Account
Option<T> // An optional account that may or may not be provided so its of type : Some(account)

UncheckedAccount<'info> // ❗ used if the account u are giving needs no check, cuzz sometimes you dont need any checks on it
AccountInfo<'info> // == UncheckedAccount, the only difference the AccountInfo is solana based but UncheckAccount belongs to anchor -- SR must be looking for this type of things

pub mint: InterfaceAccount<'info, Mint>, // # This accepts both the original Token Program and the new "Token Extensions" (Token-2022) program
// ! Account<'info, Mint> This usually only accepts the original Token Program
// UncheckedAccount can be converted to AccountInfo using \`.to_account_info()\`

// Here T can be custom structs or :`
      },
      { type: "subtitle", content: "Create a PDA - Mint Type Account" },
      {
        type: "code",
        code: `#[account(
   init, // the combo of init + below mint::token_program  decides who the owner is about to be
   seeds = [b"mint", ...], // seeds used for PDA derivation
   bump,
   payer = payer,
   mint::decimals = 9,
   mint::authority = authority, // Account<'info, T> allows checks like has_one, ownership, etc.
   mint::token_program = token_program // Interface<'info, TokenInterface> -> Owner becomes SPL Token Program
)]
pub f_token_mint: InterfaceAccount<'info, Mint>,`
      },
      { type: "subtitle", content: "Metaplex Metadata Account" },
      {
        type: "code",
        code: `// REMEMBER when this specific instruction runs it will revert if Signer of this tx != ur Mint token Publickey.data.mint_authority ! 
// -- so an attacker can never over take it before you unless attacker is able to sign both the insteruction Mint token & metadata both
// The account is not being initialized by this program, because if it were, we would see init used in the account constraints. Instead, seeds are used.
// The reason seeds are used here is not to create the account, but to verify that the metadata_account public key passed by the user matches the expected PDA derived from those seeds.
// This account does not exist yet — it’s just an empty public key. The actual account creation will happen inside the function body, when the program calls the Metaplex program to create the metadata account.

#[account(
mut,
seeds = [
    b"metadata", 
    token_metadata_program.key().as_ref(), // metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
    mint.key().as_ref()
],
bump, 
seeds::program = token_metadata_program.key(), // Don't use my ID for the math. Use the Metaplex ID instead cuzz this PDA of metaplex is not gonna be stored in my porgram instead in Metaplex's account
)]
pub metadata_account: UncheckedAccount<'info>,

// Visual Representation of MetadataAccount
MetadataAccount { // THE OUTER BOX (Solana Account Wrapper)
    address:    "87...metadata",                                // 📍 PDA: hash("metadata" + MetaplexID + MintAddress)
    owner:      "metaqbxxUunv5rk9F3DPenC7VIiGas5uycryjUd29Fr",  // 👷 The Metaplex Program ID
    lamports:   1234567,                                        // 💰 Rent-exempt balance
    executable: false,                                          // ⚙️ False = This is a storage account
    
    // 📦 DATA FIELD (The Metaplex Metadata Layout)
    data: { 
        key: "MetadataV1",                                      // 🔑 Account type discriminator
        update_authority: "Mint_Authority_Key",                 // ✍️ Usually the entity that created the Mint (mint::authority)
        mint: "Mint_Account_Key",                               // 🪙 The Token Mint this metadata belongs to
        primary_sale_happened: false,                           // 🏷️ Boolean flag for initial sale
        is_mutable: true,                                       // 🔒 Can this be changed later?
        
        // 🔗 NESTED TOKEN DATA (Filled inside the instruction arguments)
        data: { 
            name: "dogwifhat",                                  // 📛 arg: name
            symbol: "$WIF",                                     // 🏷️ arg: symbol
            uri: "https://bafkreihwq...link",                   // 🌐 arg: uri (Link to off-chain JSON)
            seller_fee_basis_points: 0,                         // 💸 Royalties (0%)
            creators: null                                      // 🎨 Creators list
        }
    }
}`
      },
      { type: "subtitle", content: "Mint" },
      {
        type: "code",
        code: `// if you provide the ATA type of account in Mint and expect it to pass cuzz the owner of both are same, svm also checks for the data length etc...

Mint { // THE OUTER BOX (The Solana System Wrapper)

    key:      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",   // 📍 Keypair public Account address
    owner:    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",   // 👷 The LANDLORD — must be the SPL Token Program
    lamports: 1461600,                                 // 💰 Rent-exempt balance (~0.00146 SOL)
    executable: false,                                 // ⚙️ CODE? (False = pure data storage)
    data : {
        mint_authority:   Some("----Circle's Address----"),  // 🏭 Who can mint new tokens? (Circle's mint authority for USDC — or None if renounced)
        supply:           9_999_999_999_999_000,             // 💵 Total tokens ever minted (in smallest units — here ~10 billion USDC)
        decimals:         6,                                 // 🔢 How many decimal places? (USDC = 6)
        is_initialized:   true,                              // 🚦 Has initialize_mint() been called? (almost always true)
        freeze_authority: None,                              // 🥶 Who can freeze token accounts? (None = no freezing possible — common for stablecoins)
    },
}`
      },
      { type: "subtitle", content: "TokenAccount / ATA of any Token" },
      {
        type: "code",
        code: `// 99% of the time a TokenAccount is gonna be ATA but some times it could also be a Keypair account of any user ! -- just like USDC is a KeyPair account -- if the user wants 
// if you provide the ATA type of account in TokenAccount and expect it to pass cuzz the owner of both are same, svm also checks for the data length etc... so will revert

TokenAccount {
    // --- THE OUTER BOX (Solana Account Header) ---
    key:        "---unique ATA/PDA address---",       // 📍 hash(walletaddress | ProgramId | Mint token)
    owner:      "--SPL Token Program---",             // 👷 The LANDLORD (Must be SPL Token or Token-2022)
    lamports:   2039280,                              // 💰 Rent (Token accounts take more space than Mints, so more SOL)
    executable: false,                                // ⚙️ Pure Data
    
    // --- THE INNER DATA (The Token Account Struct) ---
    data: {
        mint: "--USDC address---",       // 🪙 WHICH TOKEN? (Points to the USDC Mint address)
        
        authority: "--ALICE address--",  // 🔑 THE OWNER (The wallet address that has permission to spend)
        
        amount: 500_000_000,             // 💵 BALANCE (In raw units. Decimals=6, so this is 500.00 USDC)
        
        delegate: Some("Lending.."),     // 🤝 THE AGENT (If you gave a program permission to spend for you)
        
        delegated_amount: 100_000,       // 🛡️ ALLOWANCE (How much the 'delegate' is allowed to spend)
        
        state: "Initialized",            // 🚦 STATUS (Uninitialized, Initialized, or Frozen)
        
        is_native: None,                 // 🌍 WRAPPED SOL? (Contains a value if this is a 'Wrapped SOL' account)
        
        close_authority: None,           // 🗑️ THE JANITOR (Who can close this account and take the rent SOL)
    },
}`
      },
      { type: "subtitle", content: "Implimentation of assigning a MetaPleex's URI using trait" },
      {
        type: "code",
        code: `#[derive(Accounts)]
pub struct XYZ<'info> {}

impl XYZ <'_> {} // writing <'_> is basically nothing but saying same lifetime as my struct 
impl XYZ <'_> {} == impl<'info> InitLending<'info> {} // u could have written it like that as well its same 

// Next see how you can write a trait :

impl XYZ<'_> {
    pub fn some_function(&self, symbol: String) -> Result<()> // here &self gives you the access to the main XYZ struct & its fields which you can use in ur trait 

// Next see how you can write a trait to assign metaplex's URi for ur custom TokenAccount (either ATA/Keypair Token)

// imports mandatory :
use mpl_token_metadata::{
    instructions::CreateV1CpiBuilder,
    types::{PrintSupply, TokenStandard},
    ID as TOKEN_METADATA_PROGRAM_ID, // * metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
};

// how to do CPI (Cross-Program Invocation) as below, remember where ever the address goes its actaully expects the type AccountInfo or UncheckedAccount :

CreateV1CpiBuilder::new(---Metadata Program account----) // just like Vec::new(array)
.metadata(---pre calc metadata address account---) 
.mint(token_account_whose_URI_is_being_created, is_it_the_signer) // (account, false) // use .to_account_info() if you wanna convert any type to AccountInfo type
.authority(who_is_autority) // dont forget to use to_account_info
.update_authority(account, can_he_update) // account, true or false if its allowed to update
.payer(account) // who is signing this instruction , dont forget to use to_account_info()
.system_program(account) // again to_account_info system program
.sysvar_instructions(sysvar account) // sysvar account to_account_info()
.spl_token_program(Some(SPL_Token_account)) // last place where you can use to_aacount_info, below onwards its not used
.token_standard(TokenStandard:Fungible) // Fungible or non fungible
.seller_fee_basis_points(0) // seller fee basis points
.print_supply(PrintSupply : Unlimited) // cap
.name(var.clone()) // clone is used so that the var is not moved
.symbol(var.clone()) // same for symbol
.uri(metadata_uri) 
// metadata uri which is created as : 
        const JL_TOKEN_URI: &str = "https://cdn.instadapp.io/solana/tokens/metadata/"
        let metadata_uri = JL_TOKEN_URI.to_owned() + &format!("{}.json", symbol.to_lowercase());
.decimals(keep it same as ur created token account) 
.invoke_signed(signer_seeds)?; // since this instruction due to metaplex is gonna sign an tx for another program externally and usually a private key signs a external tx, but no program has a private key in them to sign so : in invoke_signed in my example its expected that the instruction is gonna start from a PDA who is the signer as well so : program PDA says am gonna sign it using my unique seed + bump (which i got when i was created)

// here signer_seeds :  &[&[&[u8]]] = &[&[seed_given_when_created, &[self.the_bump_saved_when_this_PDA_was_created.bump]]];`
      },
      { type: "subtitle", content: "Functional Macro" },
      {
        type: "code",
        code: `#[account(zero_copy)] // efficient and fast due to larger Struct
#[allow(dead_code)] // silences a function/var if unused by a file
#[cfg(feature = "staging")] // use this program id for testing
#[cfg(not(feature = "staging"))] // use this programId for testing that is production

// below ususally used with Zero-Copy cuzz, the program maps the on-chain data directly to a // Rust struct without "copying" it into memory. For this to work safely,
#[repr(C, packed)] // C :: Do not move my fields, Keep them exactly in the order, This makes the data predictable and cross-compatible. packed :: Remove all padding." Squash the fields together as tightly as possible.

AccountLoader<'info, T>, // for bigger structs and in a efficient way use AccountLoader, for smaller use Account, also when you use AccountLoader now inside the function you can only get the account using : ctx.account.xyz.load() where as normally you would do : ctx.account.load()`
      },
      { type: "subtitle", content: "Talking to SPL Tokens" },
      {
        type: "code",
        code: `// ! INFO: \`token\` module defaults to the old SPL Token program (No Token-2022 support).
// ! WARNING: Standard \`transfer\` (in both modules) does NOT check decimals.
// -> We import \`TransferChecked\` here to explicitly enforce decimal checks manually.
use anchor_spl::token::{self};
use anchor_spl::token_interface::{self, Mint, TokenAccount, TransferChecked}; // # Supports SPL + Token-2022

use anchor_spl::{
    // ! INFO: Raw access to the original SPL Token Crate.
    // -> Used when Anchor's wrappers are too simple and the dev needs raw constants or error codes.
    token::spl_token,

    // ! INFO: Raw access to the new Token-2022 Crate.
    // -> Required for advanced features not fully supported by Anchor's high-level types.
    token_2022::spl_token_2022,

    // ! AUDIT FLAG: Manual Extension Handling (High Complexity)
    // -> The code below implies the protocol manually decodes Token-2022 features (like Transfer Fees).
    // -> RISK: Manual byte parsing is error-prone. Verify they check \`ExtensionType\` correctly.
    token_interface::spl_token_2022::extension::{
        BaseStateWithExtensions, // Helper to read standard data (balance, owner) from a complex account.
        ExtensionType,           // The specific "Feature Flag" (e.g., is this a TransferFeeConfig?).
        StateWithExtensions,     // The tool to unpack the extra data bytes at the end of the account.
    },
};`
      },
      { type: "subtitle", content: "anchor_spl derived struct" },
      {
        type: "code",
        code: `use anchor_spl::token_interface::{self, Mint, TokenAccount, TransferChecked};
TransferChecked { // use .to_account_info() : to convert InterfaceAccount to AccountInfo
from : // expects AccountInfo
to : // expects AccountInfo
authority : // expects AccountInfo
mint : // expects AcccountInfo 
}`
      },
      { type: "subtitle", content: "Derive Macro" },
      {
        type: "code",
        code: `#[derive(AnchorSerialize, AnchorDeserialize, Clone)] // any cutom struct 1st time entering in solana world through the frontend world, that is passed as arguments`
      },
      { type: "subtitle", content: "What Anchor Imports" },
      {
        type: "code",
        code: `use anchor_lang::prelude::*; // research more if anything else is imported too ?
AccountInfo, // UncheckAccount but the struct belong to Rust not Anchor
Pubkey, 
Context, 
Result, 
and msg!`
      },
      { type: "subtitle", content: "Account Creation Struct" },
      {
        type: "code",
        code: `#[account(
     init, // does not take any parameter just tells this account is being initsalized
     payer = whoever is paying for this account init
     space = size_of::<StructName>() + 8 // the space this account will take when init     
     seeds = [] \\ discuused above snippet
     bump // still not clear why 
     mut    // tells wether the account is being mutated or not -- when init, lamports value changes, so mut

     close = signer // closes the account and returns the lamports to the signer

     realloc = size_of::<StructName>() + 8 + 1000,  // wanna increase the data size, by 1000     
     realloc::payer = signer,        // extra lamports will be given by signer      
     realloc::zero = false,       // false indicate dont erase the old data, true means erase the old one
)]`
      },
      { type: "subtitle", content: "Context & Lamports" },
      {
        type: "code",
        code: `ctx.accounts.acct.to_account_info().lamports() // ❗remember it tells the total lmaport of an account -- which will have some sol transferred by someone + rent extempt sol to keep the account alive`
      },
      { type: "subtitle", content: "Inside the fucntion" },
      {
        type: "code",
        code: `Pubkey::default() // system_prgram public key \`1111....32 times...1111\`// [0, 0, 0, ... 0] zero address in bytes, in solana if mistakenly you dont put any Pubkey it defaults it to system_program;s address`
      },
      { type: "subtitle", content: "sysvar account" },
      {
        type: "code",
        code: `#[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
pub sysvar_instruction: UncheckedAccount<'info>, // a specific constant address, Allows the program to "look" at the other instructions in the same transaction (Introspection).
// Why it's likely there: It is usually used to prevent Flash Loans or to ensure the user isn't doing something "tricky" in a different part of the transaction.

pub rent: Sysvar<'info, Rent>, // Tells the program how much SOL is needed to keep an account alive on the blockchain so it doesn't get deleted.
// Why it's likely there: it was used before but now has not much use old version of splana uses it`
      },
      { type: "subtitle", content: "Transfer Native SOL (CPI)" },
      {
        type: "code",
        code: `// learn more from : https://rareskills.io/post/anchor-transfer-sol

#[derive(Accounts)]
pub struct SendSol<'info> {    /// CHECK: we do not read or write the data of this account    

#[account(mut)]   
 recipient: UncheckedAccount<'info>,   
     
system_program: Program<'info, System>,    // this is like EVM a hardcode address : 11111111111111111111111111111111

#[account(mut)]    
signer: Signer<'info>,
}

inside the function : param is : amount

use anchor_lang::system_program; // this will be included in the header 

let cpi_context = CpiContext::new(
            
     ctx.accounts.system_program.to_account_info(),    // calling to system program account 
        
     system_program::Transfer {  // kind of like passing only accounts to the system program's Transfer function               
          from: ctx.accounts.signer.to_account_info(),        // from signer (only Signer can be from, else revert)       
          to: ctx.accounts.recipient.to_account_info(),        // to unchecked account    
      }        

);

let res = system_program::transfer(cpi_context, amount); // now describing the amount

// above res is : Result<()> : Do not ignore the return values of cross program invocations ❗

if res.is_ok() {            // succeeded ?
     return Ok(());        
} else {                      // failed ?
     return err!(Errors::TransferFailed);        
}


// What if there are 1000's of unchecked accounts you wanna send ur sol to ?
// would you mention all the unchecked accounts to the struct one by one ?
// the answer is remaining_accounts -- to the rescue

ctx.remaining_accounts // is an array of unchecked accounts which need not to be mentioned in the struct at all
let amount_each_gets = amount / ctx.remaining_accounts.len() as u64; // you can know its len
 for recipient in ctx.remaining_accounts { // can loop through it`
      },
      { type: "subtitle", content: "Anchor opening a PDA with seeds where the authority is the program itself & owner is system_program" },
      {
        type: "code",
        code: `use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("22222222222222222222222222222222222222222222");

#[program]
pub mod blueshift_anchor_vault {
    use super::*;

    pub fn deposit(ctx: Context<VaultAction>, amount: u64) -> Result<()> {

        require_eq!(ctx.accounts.vault.lamports(), 0, VaultError::VaultAlreadyExists);
        require_gt!(amount, Rent::get()?.minimum_balance(0), VaultError::InvalidAmount);

        let cpi_context = CpiContext::new(
            ctx.accounts.system_account.to_account_info(),
            Transfer{
                from : ctx.accounts.signer.to_account_info(),
                to : ctx.accounts.vault.to_account_info(),
            }
        );

        transfer(cpi_context, amount)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<VaultAction>) -> Result<()> {

        require_neq!(ctx.accounts.vault.lamports(), 0, VaultError::InvalidAmount);

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"vault",
            ctx.accounts.signer.to_account_info().key.as_ref(),
            &[ctx.bumps.vault],
        ]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_account.to_account_info(),
            Transfer{
                from : ctx.accounts.vault.to_account_info(),
                to : ctx.accounts.signer.to_account_info(),
            },
            signer_seeds,
        );

        transfer(cpi_context, ctx.accounts.vault.lamports())?;

        Ok(())
    }

}

#[derive(Accounts)]
pub struct VaultAction<'info> {

    #[account(mut)]
    pub signer : Signer<'info>,

    #[account(
        mut,
        seeds = [b"vault", signer.key().as_ref()],
        bump,
    )]
    pub vault : SystemAccount<'info>,

    pub system_account: Program<'info, System>,
}`
      },
      { type: "subtitle", content: "Blue shift solutions - state.rs" },
      {
        type: "code",
        code: `use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account(discriminator=1)]
pub struct Escrow {
    pub seed : u64, // number for different Escrow Account for single User
    pub maker : Pubkey, // Who creater this account ?
    pub mint_a : Pubkey, // Give this to me
    pub mint_b : Pubkey, // Get this from me
    pub receive : u64,   // maker wants this much
    pub bump : u8,       // saving this accounts bump once created
}`
      },
      { type: "subtitle", content: "Blue shift solutions - make.rs" },
      {
        type: "code",
        code: `use anchor_lang::prelude::*;

use crate::state::Escrow;

use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::transfer_checked;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked};
use crate::error::EscrowError;

#[derive(Accounts)]
#[instruction(seed : u64)]
pub struct Make<'info> {

    #[account(mut)]
    pub maker : Signer<'info>,

    #[account(
        init,
        payer = maker,
        space = Escrow::INIT_SPACE + Escrow::DISCRIMINATOR.len(),
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub escrow : Account<'info, Escrow>,

    #[account(
         mint::token_program = token_program
    )]
    pub mint_a : InterfaceAccount<'info, Mint>,

    #[account(
         mint::token_program = token_program
    )]
    pub mint_b : InterfaceAccount<'info, Mint>,

    #[account(
        mut, // * even if you are not opening the account here, you need to put mut, cuzz reducing USDC
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a : InterfaceAccount<'info, TokenAccount>, // maker's real USDC account

    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub vault : InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program : Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program : Program<'info, System>,
}

impl <'info> Make <'info> {
    fn populate_escrow(&mut self, seed : u64, receive : u64, bump : u8) -> Result<()>{
        self.escrow.set_inner(Escrow{
            seed,
            receive,
            bump,
            maker : self.maker.key(),
            mint_a : self.mint_a.key(),
            mint_b : self.mint_b.key(),
        });
        Ok(())
    }

    fn deposit_tokens(&mut self, amount : u64) -> Result<()> {

        let cpi_context = CpiContext::new(
            self.token_program.to_account_info(),
            TransferChecked {
                from : self.maker_ata_a.to_account_info(),
                mint : self.mint_a.to_account_info(),
                to : self.vault.to_account_info(),
                authority : self.maker.to_account_info(),
            }
        );

        transfer_checked(cpi_context, amount, self.mint_a.decimals)?;

        Ok(())
    }
}

pub fn handler(ctx: Context<Make>, seed : u64, receive : u64, amount : u64) -> Result<()> {

    require_gt!(receive, 0, EscrowError::InvalidAmount);
    require_gt!(amount, 0, EscrowError::InvalidAmount);

    ctx.accounts.populate_escrow(seed, receive, ctx.bumps.escrow)?;
    ctx.accounts.deposit_tokens(amount)?;

    Ok(())
}`
      },
      { type: "subtitle", content: "Blue shift solutions - take.rs" },
      {
        type: "code",
        code: `use anchor_lang::prelude::*;
use crate::state::Escrow;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, CloseAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{transfer_checked, close_account};

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker : Signer<'info>,

    #[account(mut)] // cuzz maker gonna get the sol back when the escrow account is gonna be closed
    pub maker : SystemAccount<'info>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        has_one = mint_a,
        has_one = mint_b,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow : Box<Account<'info, Escrow>>,

    // missing the check that they should belong to the right token_program cuzz its already checked in above has_one
    pub mint_a : Box<InterfaceAccount<'info, Mint>>,
    pub mint_b : Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub vault : Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_ata_a : Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_ata_b : Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
      init_if_needed,
      payer = taker,
      associated_token::mint = mint_b,
      associated_token::authority = maker,
      associated_token::token_program = token_program
    )]
    pub maker_ata_b : Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program : Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program : Program<'info, System>,
}

impl<'info>Take<'info> {

    fn transfer_to_maker(&mut self) -> Result<()>{

        let cpi_context = CpiContext::new(
            self.token_program.to_account_info(),
            TransferChecked{
                from : self.taker_ata_b.to_account_info(),
                to : self.maker_ata_b.to_account_info(),
                authority : self.taker.to_account_info(),
                mint : self.mint_b.to_account_info(),
            }
        );

        transfer_checked(cpi_context, self.escrow.receive, self.mint_b.decimals)?;
        Ok(())
    }

    fn withdraw_and_close_vault(&mut self) -> Result<()> {

        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ]];

        let cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            TransferChecked{
                from : self.vault.to_account_info(),
                to : self.taker_ata_a.to_account_info(),
                mint : self.mint_a.to_account_info(),
                authority : self.escrow.to_account_info(),
            },
            &signer_seeds,
        );

        transfer_checked(cpi_context, self.vault.amount, self.mint_a.decimals)?;

        let close_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount{
                account : self.vault.to_account_info(),
                authority : self.escrow.to_account_info(),
                destination : self.maker.to_account_info(),
            },
            &signer_seeds
        );

        close_account(close_context)?;

        Ok(())
    }

}

pub fn handler(ctx: Context<Take>) -> Result<()> {
    ctx.accounts.transfer_to_maker()?;
    ctx.accounts.withdraw_and_close_vault()?;
    Ok(())
}`
      },
      { type: "subtitle", content: "Blue shift solutions - refund.rs" },
      {
        type: "code",
        code: `use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use crate::state::Escrow;
use anchor_spl::token_interface::{Mint, TokenInterface, TokenAccount, TransferChecked, CloseAccount};
use anchor_spl::token_interface::{transfer_checked, close_account};
use crate::instructions::Take;

#[derive(Accounts)]
pub struct Refund<'info>{

    #[account(mut)]
    pub maker : Signer<'info>,

    #[account(
        mut,
        close = maker,
        has_one = maker,
        has_one = mint_a,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow : Box<Account<'info, Escrow>>,

    pub mint_a : Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub vault : Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a : Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program : Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program : Program<'info, System>,
}

impl<'info>Refund<'info>{
    fn refund_to_maker_and_close_vault(&mut self) -> Result<()> {

        let signer_seeds: [&[&[u8]]; 1] = [&[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ]];

        let cpi_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            TransferChecked{
                from : self.vault.to_account_info(),
                to: self.maker_ata_a.to_account_info(),
                mint : self.mint_a.to_account_info(),
                authority : self.escrow.to_account_info(),
            },
            &signer_seeds
        );

        transfer_checked(cpi_context, self.vault.amount, self.mint_a.decimals)?;

        let close_context = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount{
                account : self.vault.to_account_info(),
                authority : self.escrow.to_account_info(),
                destination : self.maker.to_account_info(),
            },
            &signer_seeds
        );

        close_account(close_context)?;

        Ok(())
    }
}

pub fn handler(ctx: Context<Refund>) -> Result<()> {
    ctx.accounts.refund_to_maker_and_close_vault()?;
    Ok(())
}`
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
  // 15. ::from()
  // =========================================================
  {
    id: "from_trait",
    title: "::from()",
    summary: "Type conversions without loss.",
    sections: [
      { type: "subtitle", content: "Basics" },
      {
        type: "code",
        code: `    let arr = [1, 2, 3];
    let s = HashSet::from(arr); // HashSet::from works for arrays, but not for iterators or slices

    let v: Vec<i32> = Vec::from(a);

// but for hashMap we dont need array we need a tuple so :
    let pairs = [(1, 10), (2, 20), (3, 30)];
    let _m: HashMap<i32, i32> = HashMap::from(pairs);

// even slices can make vec and hasSet
    let a = [1, 2, 3, 4, 5];
    let slice = &a[0..2];
    let result = Vec::from(slice); // same for hasSet

u16::from(i) // a type can be converted to other using from 
// for eg if i is u8 it can be convered to u16 but remember if i would have been u32 it would still be converted but had to loose data

 i32::from(b) // here if b is bool will converted to 0 or 1

  Option::from(42) == Some(42) // option too can be done

    let a = [vec![1], vec![2], vec![3]];
    let slice = &a[..]; // or below can be used to_vec as well
    let v = Vec::from(slice); // this will also work cuzz a is array of non copy types but slice makes it reference so move does not happen on from`
      }
    ]
  },

  // =========================================================
  // 16. UTILITY FUNCTIONS
  // =========================================================
  {
    id: "utility",
    title: "Utility Functions",
    summary: "Math, formatting, and helpers.",
    sections: [
      { type: "subtitle", content: "Math & Strings" },
      {
        type: "code",
        code: `f32::sqrt(a); // sqrt of a
a.powi(b).  // a^b

i32::from(a); // converting whaterve a is of type to i32 -- make sure no loss happens
string_var.to_uppercase() // converts upper case
string_var.to_lowercase() // converts to lower case
only_borrowed_reference_value.to_owned() // only works in any type of "Borrowed" reference, now it makes you the owner of the referenced value and a copy so that now you can edit it previously it was owned by someone else and that is the reason you got & reference so now you have a copy and u are the owner 
format!() // creates a new string eg : format!("jl-{}", symbol.to_uppercase()); -> \`jl-XYZ\` if xyz is symbol`
      }
    ]
  },

  // =========================================================
  // 17. HASHMAPS
  // =========================================================
  {
    id: "hashmaps",
    title: "Hashmaps aka maps",
    summary: "Key-value storage.",
    sections: [
      { type: "note", content: "Remember, keys in a HashMap must remain immutable after insertion. Since modifying a key would change its hash and potentially collide with existing keys, you must create a new HashMap and reassign entries instead of mutating keys directly." },
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
hm.values(); // returns ITERATOR over REFERENCE to the values

.values_mut() // it returns an iterator of mutable references to the values in the HashMap
.iter_mut() // does not consume the collection remember
.contains_key(&k) // return bool, is the given & of k as a key present in the hash map or not`
      },
      { type: "subtitle", content: "Iteration & Values" },
      {
        type: "code",
        code: `let m = &HashMap::from([(1,2),(3,4),(5,1)]);
 for (k, v) in m { // if m is a hashmap you can get (k,v) without eneumarate usage dont confuse them they both are different things

pub fn prod_values(m: &HashMap<i32, i32>) -> i32 { // 1 line soln to get product of values of a map
    m.values().copied().product()
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
        code: `    // HashMaps (order doesn't matter!)
    let m1 = HashMap::from([(3, 4), (1, 2)]);
    let m2 = HashMap::from([(1, 2), (3, 4)]);
    println!("m1 == m2: {}", m1 == m2); `
      }
    ]
  },

  // =========================================================
  // 18. TRAIT & IMPLEMENTATION
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
  // 19. TURBOFISH
  // =========================================================
  {
    id: "turbofish",
    title: "TurboFish",
    summary: "Type inference using ::<>",
    sections: [
      { type: "subtitle", content: "Basics" },
      {
        type: "code",
        code: `.sum::<i32>() // when we wanna explicitly tell what should be the sum type 
  
    let v = vec![1, 2, 3, 4, 5];
    let set: HashSet<i32> = v.into_iter().collect(); // can also be done as below 
let set = v.into_iter().collect::<HashSet<i32>>(); // look above how turbofish helps`
      }
    ]
  },

  // =========================================================
  // 20. RUST MAP & CLOSURE
  // =========================================================
  {
    id: "map_closure",
    title: "Rust Map & Closure",
    summary: "Iterator mapping and anonymous functions.",
    sections: [
      { type: "subtitle", content: "Basics & Syntax" },
      {
        type: "code",
        code: `v.into_iter().map(xyz).collect::<Vec<i32>>(); // here map attaches a function named xyz to each iteraeted value does the function and again returns updated value

// above function xyz can be made as closure if the function is small & simple
    let xyz = |x: i32| -> i32 { x + 1 }; // or also can be written as let xyz = |x|{ x + 1 };
v.into_iter().map(xyz).collect::<Vec<i32>>()`
      },
      { type: "subtitle", content: "Advanced Examples" },
      {
        type: "code",
        code: `// more closure code :
fn main() {
    let mul_of_2_or_3 = |x: i32| {
        if x % 2 == 0 {
            return Some(2);
        } else if x % 3 == 0 {
            return Some(3);
        }
        None
    };

    let result = (0..=10)
        .into_iter()
        .map(mul_of_2_or_3)
        .collect::<Vec<Option<i32>>>();
    println!("{:?}", result);
}

    let v = [1, 2, 3]; // below is closure defined inside the map itself its idiomatic 
    let sum_of_squares: i32 = v.into_iter().map(|x|x*x).sum(); // == v.into_iter().map(|x|{x*x}).sum();

    v.into_iter().map(|x| x < 10).collect() // here |x| x < 10 automaticlaly returns true or false based on what vlaue while we get for each iteration 

    v.into_iter().map(i128::from).collect() // converts vec<i32> to vec<i128> 

    v.into_iter().map(|x|**x).collect() // the most idomatic way to dereference without .copied().copied()

    v.into_iter().map(|x| x+1).map(|x| x*x).sum() // iterating doing +1 then squaring it 

 let grid = [[0, 0, 0], [1, 1, 1], [2, 2, 2]];
    grid.into_iter().map(|row| row.into_iter().sum::<i32>() ).sum()  // gives the sum of grid in single go`
      }
    ]
  },

  // =========================================================
  // 21. ITERATOR & RANGES
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
// A type of &mut &mut doesn't support into_iter() & also takes ownership of any_collection 

<new collection type> = any_collection.into_iter().collect() // iterator.collect() makes any collection of other mentioned collection 
eg : let s: HashSet<i32> = v.into_iter().collect(); or vice versa, basically from any collection to any other`
      },
      { type: "subtitle", content: "Filter" },
      {
        type: "code",
        code: `    let v = vec![1, 2, 3, 4]; // below can also be written as : .filter(|&x| x % 2 == 0)
    let even_v = v.into_iter().filter(|x| *x % 2 == 0).collect::<Vec<i32>>(); // used to choose which elements in an iterator to keep and which to discard, If the iterator was originally on a vector, the order will be preserved, If true, the item is kept; if false, it is discarded.`
      },
      { type: "subtitle", content: "Iter & Copied Details" },
      {
        type: "code",
        code: `s.iter() // this will revert is s is reference to mutable (&mut) cuzz iter gives only reference to immutable object
.copied() // takes & to anything and returns without it but also if its &mut it will even eat the mut too so &mut i32 == &i32 after the copied is gonna be i32`
      },
      { type: "subtitle", content: "Functions that only support Iterators" },
      {
        type: "code",
        code: `let result: i32 = v.into_iter().sum(); // note when used like this sum needs a mentioned type like \`: i32\`, else reverts, it can be removed but in some time in future it needs to be resolved 

// as you can see above line is a single line where i32 needs to be mentioned but what if we are using sum inside the filer or map then if wanna not store the data in result we would replace sum as : sum::<i32>() to type cast the sum !

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

for e in w  vs for e in w.iter_mut() // both same but w.iter_mut() does not consume w

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
into_iter absorbs just 1 outer & and rest of it ignores

let mut v: Vec<i32> = vec![1, 2, 3];
add_to_index(v: &mut Vec<i32>) // passed above v to the function 

for (i, e) in v.iter().enumerate() { // this is still gonna give you immutable reference as (&mut).iter() is gonna give you reference to immutable 
// so instead need to use : iter_mut()

.enumerate().rev() // similarly to loop in reverse & iterator`
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
  // 22. OWNERSHIP & CONSUMPTION
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
                    topic.title.toLowerCase().includes("from") ? "➡️" :
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
                    topic.title.toLowerCase().includes("anchor") ? "⚓" :
                    topic.title.toLowerCase().includes("turbofish") ? "🐟" :
                    topic.title.toLowerCase().includes("map") || topic.title.toLowerCase().includes("closure") ? "🗺️" : "📝"}
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