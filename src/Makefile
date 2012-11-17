include ../Makefile.inc

default: all

# Note: These are in a very specific order.
BEGINNING = start.xml start.html
JAVASCRIPT = jwplayer.js jwplayer.html5.js dropbox.js mn.js
MIDDLE = body.html $(JAVASCRIPT)
END = end.html end.xml

SRC_FILES = $(BEGINNING) $(MIDDLE) $(END)

all: $(SRC_FILES)
	cat $(SRC_FILES) > ../$(OUTPUT)