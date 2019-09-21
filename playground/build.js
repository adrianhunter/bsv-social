(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runtypes_1 = require("runtypes");
const Vector = runtypes_1.Tuple(runtypes_1.Number, runtypes_1.Number, runtypes_1.Number);
const Asteroid = runtypes_1.Record({
    type: runtypes_1.String,
    mass: runtypes_1.Number
});

var check = runtypes_1.Number.check

class Foo {

    static check = check
}

Foo.deps = {check}
async function main() {
    const run = new Run({ network: 'mock' });
    class Event extends Jig {
        init(name) {
            this.name = name;
        }
    }


    Event.deps = {check}
    const event = new Event('coachella');
    console.log('event', event);
}
main();

},{"runtypes":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
function Contract() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    var lastIndex = runtypes.length - 1;
    var argTypes = runtypes.slice(0, lastIndex);
    var returnType = runtypes[lastIndex];
    return {
        enforce: function (f) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length < argTypes.length)
                throw new errors_1.ValidationError("Expected " + argTypes.length + " arguments but only received " + args.length);
            for (var i = 0; i < argTypes.length; i++)
                argTypes[i].check(args[i]);
            return returnType.check(f.apply(void 0, args));
        }; },
    };
}
exports.Contract = Contract;

},{"./errors":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("./errors");
var prototypes = new WeakMap();
/**
 * A parameter decorator. Explicitly mark the parameter as checked on every method call in combination with `@checked` method decorator. The number of `@check` params must be the same as the number of provided runtypes into `@checked`.\
 * Usage:
 * ```ts
 * @checked(Runtype1, Runtype3)
 * method(@check p1: Static1, p2: number, @check p3: Static3) { ... }
 * ```
 */
function check(target, propertyKey, parameterIndex) {
    var prototype = prototypes.get(target) || new Map();
    prototypes.set(target, prototype);
    var validParameterIndices = prototype.get(propertyKey) || [];
    prototype.set(propertyKey, validParameterIndices);
    validParameterIndices.push(parameterIndex);
}
exports.check = check;
function getValidParameterIndices(target, propertyKey, runtypeCount) {
    var prototype = prototypes.get(target);
    var validParameterIndices = prototype && prototype.get(propertyKey);
    if (validParameterIndices) {
        // used with `@check` parameter decorator
        return validParameterIndices;
    }
    var indices = [];
    for (var i = 0; i < runtypeCount; i++) {
        indices.push(i);
    }
    return indices;
}
/**
 * A method decorator. Takes runtypes as arguments which correspond to the ones of the actual method.
 *
 * Usually, the number of provided runtypes must be _**the same as**_ or _**less than**_ the actual parameters.
 *
 * If you explicitly mark which parameter shall be checked using `@check` parameter decorator, the number of `@check` parameters must be _**the same as**_ the runtypes provided into `@checked`.
 *
 * Usage:
 * ```ts
 * @checked(Runtype1, Runtype2)
 * method1(param1: Static1, param2: Static2, param3: any) {
 *   ...
 * }
 *
 * @checked(Runtype1, Runtype3)
 * method2(@check param1: Static1, param2: any, @check param3: Static3) {
 *   ...
 * }
 * ```
 */
function checked() {
    var runtypes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        runtypes[_i] = arguments[_i];
    }
    if (runtypes.length === 0) {
        throw new Error('No runtype provided to `@checked`. Please remove the decorator.');
    }
    return function (target, propertyKey, descriptor) {
        var method = descriptor.value;
        var methodId = (target.name || target.constructor.name + '.prototype') +
            (typeof propertyKey === 'string' ? "[\"" + propertyKey + "\"]" : "[" + String(propertyKey) + "]");
        var validParameterIndices = getValidParameterIndices(target, propertyKey, runtypes.length);
        if (validParameterIndices.length !== runtypes.length) {
            throw new Error('Number of `@checked` runtypes and @check parameters not matched.');
        }
        if (validParameterIndices.length > method.length) {
            throw new Error('Number of `@checked` runtypes exceeds actual parameter length.');
        }
        descriptor.value = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            runtypes.forEach(function (type, typeIndex) {
                var parameterIndex = validParameterIndices[typeIndex];
                try {
                    type.check(args[parameterIndex]);
                }
                catch (err) {
                    throw new errors_1.ValidationError(methodId + ", argument #" + parameterIndex + ": " + err.message);
                }
            });
            return method.apply(this, args);
        };
    };
}
exports.checked = checked;

},{"./errors":4}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message, key) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.key = key;
        _this.name = 'ValidationError';
        Object.setPrototypeOf(_this, ValidationError.prototype);
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;

},{}],5:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./contract"));
__export(require("./match"));
__export(require("./errors"));
__export(require("./types/unknown"));
__export(require("./types/never"));
__export(require("./types/void"));
var literal_1 = require("./types/literal");
exports.Literal = literal_1.Literal;
exports.Undefined = literal_1.Undefined;
exports.Null = literal_1.Null;
__export(require("./types/boolean"));
__export(require("./types/number"));
__export(require("./types/string"));
__export(require("./types/symbol"));
__export(require("./types/array"));
__export(require("./types/tuple"));
__export(require("./types/record"));
__export(require("./types/partial"));
__export(require("./types/dictionary"));
__export(require("./types/union"));
__export(require("./types/intersect"));
__export(require("./types/function"));
var instanceof_1 = require("./types/instanceof");
exports.InstanceOf = instanceof_1.InstanceOf;
__export(require("./types/lazy"));
__export(require("./types/constraint"));
var brand_1 = require("./types/brand");
exports.Brand = brand_1.Brand;
__export(require("./decorator"));

},{"./contract":2,"./decorator":3,"./errors":4,"./match":6,"./types/array":9,"./types/boolean":10,"./types/brand":11,"./types/constraint":12,"./types/dictionary":13,"./types/function":14,"./types/instanceof":15,"./types/intersect":16,"./types/lazy":17,"./types/literal":18,"./types/never":19,"./types/number":20,"./types/partial":21,"./types/record":22,"./types/string":23,"./types/symbol":24,"./types/tuple":25,"./types/union":26,"./types/unknown":27,"./types/void":28}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function match() {
    var cases = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        cases[_i] = arguments[_i];
    }
    return function (x) {
        for (var _i = 0, cases_1 = cases; _i < cases_1.length; _i++) {
            var _a = cases_1[_i], T = _a[0], f = _a[1];
            if (T.guard(x))
                return f(x);
        }
        throw new Error('No alternatives were matched');
    };
}
exports.match = match;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var show_1 = require("./show");
function create(check, A) {
    A.check = check;
    A.validate = validate;
    A.guard = guard;
    A.Or = Or;
    A.And = And;
    A.withConstraint = withConstraint;
    A.withGuard = withGuard;
    A.withBrand = withBrand;
    A.reflect = A;
    // A.toString = function () { return "Runtype<" + show_1.default(A) + ">"; };
    return A;
    function validate(value) {
        try {
            check(value);
            return { success: true, value: value };
        }
        catch (_a) {
            var message = _a.message, key = _a.key;
            return { success: false, message: message, key: key };
        }
    }
    function guard(x) {
        return validate(x).success;
    }
    function Or(B) {
        return index_1.Union(A, B);
    }
    function And(B) {
        return index_1.Intersect(A, B);
    }
    function withConstraint(constraint, options) {
        return index_1.Constraint(A, constraint, options);
    }
    function withGuard(guard, options) {
        return index_1.Constraint(A, guard, options);
    }
    function withBrand(B) {
        return index_1.Brand(B, A);
    }
}
exports.create = create;

},{"./index":5,"./show":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var show = function (needsParens) { return function (refl) {
    var parenthesize = function (s) { return (needsParens ? "(" + s + ")" : s); };
    switch (refl.tag) {
        // Primitive types
        case 'unknown':
        case 'never':
        case 'void':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
        case 'function':
            return refl.tag;
        // Complex types
        case 'literal': {
            var value = refl.value;
            return typeof value === 'string' ? "\"" + value + "\"" : String(value);
        }
        case 'array':
            return "" + readonlyTag(refl) + show(true)(refl.element) + "[]";
        case 'dictionary':
            return "{ [_: " + refl.key + "]: " + show(false)(refl.value) + " }";
        case 'record': {
            var keys = Object.keys(refl.fields);
            return keys.length
                ? "{ " + keys
                    .map(function (k) { return "" + readonlyTag(refl) + k + ": " + show(false)(refl.fields[k]) + ";"; })
                    .join(' ') + " }"
                : '{}';
        }
        case 'partial': {
            var keys = Object.keys(refl.fields);
            return keys.length
                ? "{ " + keys.map(function (k) { return k + "?: " + show(false)(refl.fields[k]) + ";"; }).join(' ') + " }"
                : '{}';
        }
        case 'tuple':
            return "[" + refl.components.map(show(false)).join(', ') + "]";
        case 'union':
            return parenthesize("" + refl.alternatives.map(show(true)).join(' | '));
        case 'intersect':
            return parenthesize("" + refl.intersectees.map(show(true)).join(' & '));
        case 'constraint':
            return refl.name || show(needsParens)(refl.underlying);
        case 'instanceof':
            var name_1 = refl.ctor.name;
            return "InstanceOf<" + name_1 + ">";
        case 'brand':
            return show(needsParens)(refl.entity);
    }
}; };
exports.default = show(false);
function readonlyTag(_a) {
    var isReadonly = _a.isReadonly;
    return isReadonly ? 'readonly ' : '';
}

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Construct an array runtype from a runtype for its elements.
 */
function InternalArr(element, isReadonly) {
    return withExtraModifierFuncs(runtype_1.create(function (xs) {
        if (!Array.isArray(xs))
            throw new errors_1.ValidationError("Expected array, but was " + typeof xs);
        for (var _i = 0, xs_1 = xs; _i < xs_1.length; _i++) {
            var x = xs_1[_i];
            try {
                element.check(x);
            }
            catch (_a) {
                var message = _a.message, key = _a.key;
                throw new errors_1.ValidationError(message, key ? "[" + xs.indexOf(x) + "]." + key : "[" + xs.indexOf(x) + "]");
            }
        }
        return xs;
    }, { tag: 'array', isReadonly: isReadonly, element: element }));
}
function Arr(element) {
    return InternalArr(element, false);
}
exports.Array = Arr;
function withExtraModifierFuncs(A) {
    A.asReadonly = asReadonly;
    return A;
    function asReadonly() {
        return InternalArr(A.element, true);
    }
}

},{"../errors":4,"../runtype":7}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Validates that a value is a boolean.
 */
exports.Boolean = runtype_1.create(function (x) {
    if (typeof x !== 'boolean')
        throw new errors_1.ValidationError("Expected boolean, but was " + typeof x);
    return x;
}, { tag: 'boolean' });

},{"../errors":4,"../runtype":7}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
exports.RuntypeName = Symbol('RuntypeName');
function Brand(brand, entity) {
    return runtype_1.create(function (x) { return entity.check(x); }, {
        tag: 'brand',
        brand: brand,
        entity: entity,
    });
}
exports.Brand = Brand;

},{"../runtype":7}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var string_1 = require("./string");
var errors_1 = require("../errors");
var unknown_1 = require("./unknown");
function Constraint(underlying, constraint, options) {
    return runtype_1.create(function (x) {
        var name = options && options.name;
        var typed = underlying.check(x);
        var result = constraint(typed);
        if (string_1.String.guard(result))
            throw new errors_1.ValidationError(result);
        else if (!result)
            throw new errors_1.ValidationError("Failed " + (name || 'constraint') + " check");
        return typed;
    }, {
        tag: 'constraint',
        underlying: underlying,
        constraint: constraint,
        name: options && options.name,
        args: options && options.args,
    });
}
exports.Constraint = Constraint;
exports.Guard = function (guard, options) { return unknown_1.Unknown.withGuard(guard, options); };

},{"../errors":4,"../runtype":7,"./string":23,"./unknown":27}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var show_1 = require("../show");
var errors_1 = require("../errors");
function Dictionary(value, key) {
    if (key === void 0) { key = 'string'; }
    return runtype_1.create(function (x) {
        if (x === null || x === undefined) {
            var a = runtype_1.create(x, { tag: 'dictionary', key: key, value: value });
            throw new errors_1.ValidationError("Expected " + show_1.default(a) + ", but was " + x);
        }
        if (typeof x !== 'object') {
            var a = runtype_1.create(x, { tag: 'dictionary', key: key, value: value });
            throw new errors_1.ValidationError("Expected " + show_1.default(a.reflect) + ", but was " + typeof x);
        }
        if (Object.getPrototypeOf(x) !== Object.prototype) {
            if (!Array.isArray(x)) {
                var a = runtype_1.create(x, { tag: 'dictionary', key: key, value: value });
                throw new errors_1.ValidationError("Expected " + show_1.default(a.reflect) + ", but was " + Object.getPrototypeOf(x));
            }
            else if (key === 'string')
                throw new errors_1.ValidationError("Expected dictionary, but was array");
        }
        for (var k in x) {
            // Object keys are unknown strings
            if (key === 'number') {
                if (isNaN(+k))
                    throw new errors_1.ValidationError("Expected dictionary key to be a number, but was string");
            }
            try {
                value.check(x[k]);
            }
            catch (_a) {
                var nestedKey = _a.key, message = _a.message;
                throw new errors_1.ValidationError(message, nestedKey ? k + "." + nestedKey : k);
            }
        }
        return x;
    }, { tag: 'dictionary', key: key, value: value });
}
exports.Dictionary = Dictionary;

},{"../errors":4,"../runtype":7,"../show":8}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Construct a runtype for functions.
 */
exports.Function = runtype_1.create(function (x) {
    if (typeof x !== 'function')
        throw new errors_1.ValidationError("Expected function, but was " + typeof x);
    return x;
}, { tag: 'function' });

},{"../errors":4,"../runtype":7}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
function InstanceOf(ctor) {
    return runtype_1.create(function (x) {
        if (!(x instanceof ctor)) {
            throw new errors_1.ValidationError("Expected " + ctor.name + ", but was " + typeof x);
        }
        return x;
    }, { tag: 'instanceof', ctor: ctor });
}
exports.InstanceOf = InstanceOf;

},{"../errors":4,"../runtype":7}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
function Intersect() {
    var intersectees = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        intersectees[_i] = arguments[_i];
    }
    return runtype_1.create(function (x) {
        for (var _i = 0, intersectees_1 = intersectees; _i < intersectees_1.length; _i++) {
            var check = intersectees_1[_i].check;
            check(x);
        }
        return x;
    }, { tag: 'intersect', intersectees: intersectees });
}
exports.Intersect = Intersect;

},{"../runtype":7}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Construct a possibly-recursive Runtype.
 */
function Lazy(delayed) {
    var data = {
        get tag() {
            return getWrapped()['tag'];
        },
    };
    var cached;
    function getWrapped() {
        if (!cached) {
            cached = delayed();
            for (var k in cached)
                if (k !== 'tag')
                    data[k] = cached[k];
        }
        return cached;
    }
    return runtype_1.create(function (x) {
        return getWrapped().check(x);
    }, data);
}
exports.Lazy = Lazy;

},{"../runtype":7}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Construct a runtype for a type literal.
 */
function Literal(value) {
    return runtype_1.create(function (x) {
        if (x !== value)
            throw new errors_1.ValidationError("Expected literal '" + value + "', but was '" + x + "'");
        return x;
    }, { tag: 'literal', value: value });
}
exports.Literal = Literal;
/**
 * An alias for Literal(undefined).
 */
exports.Undefined = Literal(undefined);
/**
 * An alias for Literal(null).
 */
exports.Null = Literal(null);

},{"../errors":4,"../runtype":7}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Validates nothing (unknown fails).
 */
exports.Never = runtype_1.create(function (x) {
    throw new errors_1.ValidationError("Expected nothing, but was " + x);
}, { tag: 'never' });

},{"../errors":4,"../runtype":7}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Validates that a value is a number.
 */
exports.Number = runtype_1.create(function (x) {
    if (typeof x !== 'number')
        throw new errors_1.ValidationError("Expected number, but was " + (x === null || x === undefined ? x : typeof x));
    return x;
}, { tag: 'number' });

},{"../errors":4,"../runtype":7}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var show_1 = require("../show");
var errors_1 = require("../errors");
/**
 * Construct a runtype for partial records
 */
function Part(fields) {
    return runtype_1.create(function (x) {
        if (x === null || x === undefined) {
            var a = runtype_1.create(function (x) { return x; }, { tag: 'partial', fields: fields });
            throw new errors_1.ValidationError("Expected " + show_1.default(a) + ", but was " + x);
        }
        // tslint:disable-next-line:forin
        for (var key in fields) {
            if (util_1.hasKey(key, x) && x[key] !== undefined) {
                try {
                    fields[key].check(x[key]);
                }
                catch (_a) {
                    var message = _a.message, nestedKey = _a.key;
                    throw new errors_1.ValidationError(message, nestedKey ? key + "." + nestedKey : key);
                }
            }
        }
        return x;
    }, { tag: 'partial', fields: fields });
}
exports.Part = Part;
exports.Partial = Part;

},{"../errors":4,"../runtype":7,"../show":8,"../util":29}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var util_1 = require("../util");
var show_1 = require("../show");
var errors_1 = require("../errors");
/**
 * Construct a record runtype from runtypes for its values.
 */
function InternalRecord(fields, isReadonly) {
    return withExtraModifierFuncs(runtype_1.create(function (x) {
        if (x === null || x === undefined) {
            var a = runtype_1.create(function (x) { return x; }, { tag: 'record', fields: fields });
            throw new errors_1.ValidationError("Expected " + show_1.default(a) + ", but was " + x);
        }
        // tslint:disable-next-line:forin
        for (var key in fields) {
            try {
                fields[key].check(util_1.hasKey(key, x) ? x[key] : undefined);
            }
            catch (_a) {
                var nestedKey = _a.key, message = _a.message;
                throw new errors_1.ValidationError(message, nestedKey ? key + "." + nestedKey : key);
            }
        }
        return x;
    }, { tag: 'record', isReadonly: isReadonly, fields: fields }));
}
exports.InternalRecord = InternalRecord;
function Record(fields) {
    return InternalRecord(fields, false);
}
exports.Record = Record;
function withExtraModifierFuncs(A) {
    A.asReadonly = asReadonly;
    return A;
    function asReadonly() {
        return InternalRecord(A.fields, true);
    }
}

},{"../errors":4,"../runtype":7,"../show":8,"../util":29}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Validates that a value is a string.
 */
exports.String = runtype_1.create(function (x) {
    if (typeof x !== 'string')
        throw new errors_1.ValidationError("Expected string, but was " + (x === null || x === undefined ? x : typeof x));
    return x;
}, { tag: 'string' });

},{"../errors":4,"../runtype":7}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var errors_1 = require("../errors");
/**
 * Validates that a value is a symbol.
 */
var Sym = runtype_1.create(function (x) {
    if (typeof x !== 'symbol')
        throw new errors_1.ValidationError("Expected symbol, but was " + (x === null || x === undefined ? x : typeof x));
    return x;
}, { tag: 'symbol' });
exports.Symbol = Sym;

},{"../errors":4,"../runtype":7}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var array_1 = require("./array");
var errors_1 = require("../errors");
var unknown_1 = require("./unknown");
function Tuple() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return runtype_1.create(function (x) {
        var xs;
        try {
            xs = array_1.Array(unknown_1.Unknown).check(x);
        }
        catch (_a) {
            var key = _a.key, message = _a.message;
            throw new errors_1.ValidationError("Expected tuple to be an array:\u00A0" + message, key);
        }
        if (xs.length < components.length)
            throw new errors_1.ValidationError("Expected an array of length " + components.length + ", but was " + xs.length);
        for (var i = 0; i < components.length; i++) {
            try {
                components[i].check(xs[i]);
            }
            catch (_b) {
                var message = _b.message, nestedKey = _b.key;
                throw new errors_1.ValidationError(message, nestedKey ? "[" + i + "]." + nestedKey : "[" + i + "]");
            }
        }
        return x;
    }, { tag: 'tuple', components: components });
}
exports.Tuple = Tuple;

},{"../errors":4,"../runtype":7,"./array":9,"./unknown":27}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
var show_1 = require("../show");
var errors_1 = require("../errors");
function Union() {
    var alternatives = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        alternatives[_i] = arguments[_i];
    }
    var match = function () {
        var cases = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cases[_i] = arguments[_i];
        }
        return function (x) {
            for (var i = 0; i < alternatives.length; i++) {
                if (alternatives[i].guard(x)) {
                    return cases[i](x);
                }
            }
        };
    };
    return runtype_1.create(function (x) {
        for (var _i = 0, alternatives_1 = alternatives; _i < alternatives_1.length; _i++) {
            var guard = alternatives_1[_i].guard;
            if (guard(x))
                return x;
        }
        var a = runtype_1.create(x, { tag: 'union', alternatives: alternatives });
        throw new errors_1.ValidationError("Expected " + show_1.default(a) + ", but was " + typeof x);
    }, { tag: 'union', alternatives: alternatives, match: match });
}
exports.Union = Union;

},{"../errors":4,"../runtype":7,"../show":8}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runtype_1 = require("../runtype");
/**
 * Validates anything, but provides no new type information about it.
 */
exports.Unknown = runtype_1.create(function (x) { return x; }, { tag: 'unknown' });

},{"../runtype":7}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var unknown_1 = require("./unknown");
/**
 * Void is an alias for Unknown
 *
 * @deprecated Please use Unknown instead
 */
exports.Void = unknown_1.Unknown;

},{"./unknown":27}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Type guard to determine if an object has a given key
// If this feature gets implemented, we can use `in` instead: https://github.com/Microsoft/TypeScript/issues/10485
function hasKey(k, o) {
    return typeof o === 'object' && k in o;
}
exports.hasKey = hasKey;

},{}]},{},[1]);
