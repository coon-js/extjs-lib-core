# coon.core.text.transformer.html

The transformers found in this package are responsible for changing plain texts
into texts containing HTML-code.


## BlockquoteTransformer
Will parse a given text and look up quote marks (">"), interpret them as quoted
text and apply "\<blockquote\>"-tags accordingly.

### Example:
The following text 
````javascript
> In response to 
> your message
>> Lets meet at noon
>> in front of the barn
> I hereby respond:
````
will be transformed to:
````javascript
<blockquote>
In response to 
your message
<blockquote>
Lets meet at noon
in front of the barn
</blockquote>
I hereby respond:
</blockquote>
````

## EmailAddressTransformer 
Will parse the given text and look up text fragments matching an EmailAddress-pattern, and create
"\<a\>"-tags out of them where the href-attribute's value is prefixed with a "mailto".  

### Example:
The following text 
````javascript
Please contact info@conjoon.org for further informations. 
````
will be transformed to:
````javascript
Please contact <a href="mailto:info@conjoon.org">info@conjoon.org</a> for further informations.
````

## HyperlinkTransformer 
Will parse the given text and look up text fragments matching an URL-pattern, and create
"\<a\>"-tags out of them.  

### Example:
The following text 
````javascript
The annual meeting of the RFC-Group https://www.rfcgroup-con.org/groupid/4?schedule=1 will
take place in the kitchen. 
````
will be transformed to:
````javascript
The annual meeting of the RFC-Group <a href="https://www.rfcgroup-con.org/groupid/4?schedule=1">https://www.rfcgroup-con.org/groupid/4?chedule=1</a> will
take place in the kitchen.

````

## LineBreakTransformer 
Will parse the given text and look up line breaks and and create "\<br /\>"-tags out of them.  

### Example:
The following text 
````javascript
This text \n 
has a lot of\n
\n
LineBreaks\n
in between. 
````
will be transformed to:
````javascript
This text <br /> 
has a lot of<br />
<br />
LineBreaks<br />
in between. 
````