/**
 * @param	{string}	path	URL of the file.
 * @return	{File}
 */
File = function( path ) {
	this.path = path;
	this.request = new XMLHttpRequest( );
	var self = this;
	this.request.addEventListener( "load", function( event ) {
		self.offset = 0;
		self.data = new Uint8Array( event.currentTarget.response );
	} );
	this.request.open( "GET", path );
	this.request.responseType = "arraybuffer";
	this.request.send( null );
}

File.prototype.addEventListener = function( eventType, listener, useCapture ) {
	var self = this;
	this.request.addEventListener( eventType, function( event ) {
		event.data = { };
		event.data.file = self;
		listener( event );
	} );
}

// Stefan S.: I need this for casting binary data to primitive types.
File.buffer = 			new ArrayBuffer( 4 );
File.buffer_byte = 		new Int8Array( File.buffer );
File.buffer_ubyte =		new Uint8Array( File.buffer );
File.buffer_short =	 	new Int16Array( File.buffer );
File.buffer_ushort = 	new Uint16Array( File.buffer );
File.buffer_int =	 	new Int32Array( File.buffer );
File.buffer_uint = 		new Uint32Array( File.buffer );
File.buffer_float =	 	new Float32Array( File.buffer );

/**
 * Seek to the given position of the file.
 * @param	{int}	position	The position.
 */
File.prototype.seek = function( position ) {
	if( position < 0 || position > this.data.length ) {
		this.offset = 0;
	}
	else {
		this.offset = position;
	}
}

/**
 * Skip the given number of bytes in the file.
 * @param	{int}	i	Number of bytes to skip.
 */
File.prototype.skip = function( i ) {
	this.offset += i;
	if( this.offset < 0 || this.offset > this.data.length ) {
		this.offset = 0;
	}
}

/**
 * Get the current position in the file.
 * @return	{int}	Current position in the file.
 */
File.prototype.tell = function( ) {
	return this.offset;
}

/**
 * Get the total size of the file.
 * @return	{int}	Size of the file.
 */
File.prototype.size = function( ) {
	return this.data.length;
}

/**
 * Read a byte.
 * @return	{int}	Signed byte.
 */
File.prototype.readByte = function( ) {
	File.buffer_byte[0] = this.data[this.offset++];
	return File.buffer_byte[0];
}

/**
 * Read an unsigned byte.
 * @return	{int}	Unsigned byte.
 */
File.prototype.readUByte = function( ) {
	File.buffer_byte[0] = this.data[this.offset++];
	return File.buffer_ubyte[0];
}

/**
 * Read a 2 byte integer (short).
 * @return	{int}	Signed short.
 */
File.prototype.readShort = function( ) {
	var data = this.data;
	var offset = this.offset;
	File.buffer_byte[0] = data[offset];
	File.buffer_byte[1] = data[offset + 1];
	this.offset += 2;
	return File.buffer_short[0];
}

/**
 * Read a 2 byte unsigned integer.
 * @return {int}	Unsigned short.
 */
File.prototype.readUShort = function( ) {
	var data = this.data;
	var offset = this.offset;
	File.buffer_byte[0] = data[offset];
	File.buffer_byte[1] = data[offset + 1];
	this.offset += 2;
	return File.buffer_ushort[0];
}

/**
 * Read a 4 byte integer.
 * @return	{int}	Signed integer.
 */
File.prototype.readInt = function( ) {
	var data = this.data;
	var offset = this.offset;
	File.buffer_byte[0] = data[offset];
	File.buffer_byte[1] = data[offset + 1];
	File.buffer_byte[2] = data[offset + 2];
	File.buffer_byte[3] = data[offset + 3];
	this.offset += 4;
	return File.buffer_int[0];
}

/**
 * Read a 4 byte unsigned integer.
 * @return	{int}	Unsigned integer.
 */
File.prototype.readUInt = function( ) {
	var data = this.data;
	var offset = this.offset;
	File.buffer_byte[0] = data[offset];
	File.buffer_byte[1] = data[offset + 1];
	File.buffer_byte[2] = data[offset + 2];
	File.buffer_byte[3] = data[offset + 3];
	this.offset += 4;
	return File.buffer_uint[0];
}

/**
 * Read a float.
 * @return	{float}	Float.
 */
File.prototype.readFloat = function( ) {
	var data = this.data;
	var offset = this.offset;
	File.buffer_byte[0] = data[offset];
	File.buffer_byte[1] = data[offset + 1];
	File.buffer_byte[2] = data[offset + 2];
	File.buffer_byte[3] = data[offset + 3];
	this.offset += 4;
	return File.buffer_float[0];
}

/**
 * Read a string until null or a given number of characters.
 * @param	{int}		length	Optional. Max number of characters to read.
 * @return	{string}	String that is read.
 */
File.prototype.readString = function( length ) {
	var temp;
	var result = "";
	while( ( temp = this.readByte( ) ) != 0 ) {
		result += String.fromCharCode( temp );
	}
	
	if( length ) {
		this.skip( length - result.length - 1 );
	}

	return result;
}

/**
 * Hack. A function for the lazy.
 * For example, file.readArray( 256, File.prototype.readShort )
 * would return an array with 256 elements each containing a short integer.
 * @param	{int}		count			Number of elements to read.
 * @param	{function}	readFunction	One of File.prototype.read functions.
 */
File.prototype.readArray = function( count, readFunction ) {
	var result = new Array( count );
	
	for( var i = 0; i < count; ++i ) {
		result[i] = readFunction.call( this );
	}
	
	return result;
}