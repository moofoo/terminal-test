
const test = require('ava');
const Terminal = require( 'terminal.js');
const AnsiParser = require( 'node-ansiparser');
const AnsiTerminal = require('node-ansiterminal').AnsiTerminal;
const ansiEscapes = require('ansi-escapes');

let terminalJS;
let ansiTerminal;
let ansiParser;

const write = (string) => {
    terminalJS.write(string);
    ansiParser.parse(string);
}

const toString = (term, stringify = false) => {
    const toString = term.toString().replace(/\n*$/, "");

    if(stringify){
        return JSON.stringify(toString);
    }

    return toString;
}

const insertLines = (count = 1) => {
	return `\x1b[${count}L`;
}

test.before(t => {
    terminalJS = new Terminal({
        rows:20,
        columns:40,
    });

    terminalJS.state.setMode('crlf', false);

    ansiTerminal = new AnsiTerminal(
        40,
        20,
        500
    );

    ansiParser = new AnsiParser(ansiTerminal);
});

test("move cursor to previous line", t => {

    write('foo\nbar\nbaz');
    write(ansiEscapes.cursorPrevLine);
    write(ansiEscapes.cursorPrevLine);
    write('boz');

    t.is(toString(ansiTerminal), "boz\n   bar\n      baz");
    t.is(toString(terminalJS), "boz\n   bar\n      baz");

/*
    Three lines are output, the cursor goes up two, and
    writes 'boz' over 'foo'. Final string output
    should be: "boz\n   bar\n      baz"

    However, TerminalJS string is  "foo\n   bar\n      baz\n\nboz",
    meaning the cursor is moving in the wrong direction
*/

//  console.log("TerminalJS Output ", toString(terminalJS, true));
//  console.log("AnsiTerminal Output ", toString(ansiTerminal, true));
});


test("cursor needs to be reset after insert line", t => {

    write('foo');
    write(insertLines(3));
    write('bar');

   t.is(toString(ansiTerminal), 'bar\n\n\nfoo');
   t.is(toString(terminalJS), 'bar\n\n\nfoo');

/*
    After write('foo'), cursor.x = 3
    After calling insertLine, it goes to 0, since insertLine resets the cursor position
    The three insertLine calls push 'foo' down three lines, but cursor.y stays at 0, since that's how it works apparently
    So after write('bar'), the output string should be 'bar\n\n\nfoo'

    However, terminalJS outputs '   bar\n\n\nfoo', which means cursor.x was not reset by insertLine
*/

//  console.log("TerminalJS Output ", toString(terminalJS, true));
//  console.log("AnsiTerminal Output ", toString(ansiTerminal, true));


});
