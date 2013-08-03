SRC = $(shell find src -name "*.js" -type f | sort)
DEST = $(SRC:src/%.js=dist/%.js)
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs


dist/%.js: src/%.js
	@mkdir -p $(@D)
	./_make/umdify $< > $@


dist/browser/Deferreds.js:
	@mkdir -p $(@D)
	(./_make/banner; ./_make/optimize $(SRC)) > $@


dist/browser/Deferreds.min.js: dist/browser/Deferreds.js
	@mkdir -p $(@D)
	(./_make/banner; $(UGLIFY) $<) > $@


dist: $(DEST) dist/browser/Deferreds.js dist/browser/Deferreds.min.js
	cp README.md dist/
	cp MIT-LICENSE.txt dist/
	cp package.json dist/


clean:
	rm -Rf dist/


ADAPTER = ./test/adapters/deferreds.js

test: dist
	./_make/test $(ADAPTER)


ALL_ADAPTERS = $(wildcard test/adapters/*.js)

test-all: dist test-aplus
	@set -e; \
	for file in $(ALL_ADAPTERS); do \
		./_make/test "$$file"; \
	done


test-aplus: dist
	./_make/test-aplus


.PHONY: dist clean test test-all test-aplus
