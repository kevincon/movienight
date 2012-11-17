include Makefile.inc

default: all

all:
	cd src; $(MAKE) $(MFLAGS)

clean:
	rm $(OUTPUT)

# Create a local web server in the current directory using Python
# and make it visible to the outside world using Local Tunnel
#
# Assumes you have Python installed (bundled with Mac/Linux) and
# Local Tunnel installed (follow instructions at:
# http://progrium.com/localtunnel/).
#
# Install HighLine too otherwise localtunnel will echo your SSH passphrase
# (gem install highline)

up: $(OUTPUT)
	python -m SimpleHTTPServer 8080 &
	localtunnel 8080

down:
	killall -v "python"