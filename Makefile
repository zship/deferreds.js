SRC = $(shell find src -name "*.js" -type f | sort)
DIST_DEST = $(SRC:src/%.js=dist/%.js)
COV_DEST = $(SRC:src/%.js=cov/%.js)
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs
JSCOVERAGE = ./node_modules/jscoverage/bin/jscoverage


dist/%.js: src/%.js
	@mkdir -p $(@D)
	./_make/umdify $< > $@


dist/browser/Deferreds.js:
	@mkdir -p $(@D)
	(./_make/banner; ./_make/optimize $(SRC)) > $@


dist/browser/Deferreds.min.js: dist/browser/Deferreds.js
	@mkdir -p $(@D)
	(./_make/banner; $(UGLIFY) $<) > $@


dist: $(DIST_DEST) dist/browser/Deferreds.js dist/browser/Deferreds.min.js
	cp README.md dist/
	cp MIT-LICENSE.txt dist/
	cp package.json dist/


cov/%.js: src/%.js
	@mkdir -p $(@D)
	$(JSCOVERAGE) $< $@


cov: $(COV_DEST)


clean:
	rm -Rf dist/
	rm -Rf cov/


ADAPTER = ./test/adapters/deferreds.js


test: dist
	./_make/test $(ADAPTER)


test-cov: cov
	./_make/test $(ADAPTER) --coverage=html-cov > cov/coverage.html


test-coveralls: cov
	./_make/test $(ADAPTER) --coverage=mocha-lcov-reporter \
		| ./node_modules/coveralls/bin/coveralls.js


ALL_ADAPTERS = $(wildcard test/adapters/*.js)


test-all: dist test-aplus
	@set -e; \
	for file in $(ALL_ADAPTERS); do \
		./_make/test "$$file"; \
	done


test-aplus: dist
	./_make/test-aplus


.PHONY: dist cov clean test test-all test-aplus test-cov test-coveralls
