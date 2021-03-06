"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var vue_class_component_1 = require("vue-class-component");
var Vue = require("vue");
var _ = require("lodash");
var parser_1 = require("../parser");
var PanelBody = (function (_super) {
    __extends(PanelBody, _super);
    function PanelBody() {
        _super.apply(this, arguments);
    }
    PanelBody.prototype.data = function () {
        return {
            banner: [],
            body: {
                goal: [],
                judgement: [],
                term: [],
                meta: [],
                sort: []
            },
            error: null,
            plainText: []
        };
    };
    PanelBody.prototype.jumpToGoal = function (index) {
        this.$dispatch("jump-to-goal", index);
    };
    Object.defineProperty(PanelBody.prototype, "rawContent", {
        set: function (content) {
            switch (content.type) {
                case 4:
                case 3:
                    var _a = parser_1.parseContent(content.body), banner = _a.banner, body = _a.body;
                    this.banner = banner;
                    this.body = {
                        goal: _.filter(body, { judgementForm: "goal" }),
                        judgement: _.filter(body, { judgementForm: "type judgement" }),
                        term: _.filter(body, { judgementForm: "term" }),
                        meta: _.filter(body, { judgementForm: "meta" }),
                        sort: _.filter(body, { judgementForm: "sort" })
                    };
                    this.error = null;
                    this.plainText = [];
                    break;
                case 1:
                    this.banner = [];
                    this.body = {
                        goal: [],
                        judgement: [],
                        term: [],
                        meta: [],
                        sort: []
                    };
                    this.error = parser_1.parseError(content.body.join("\n"));
                    this.plainText = [];
                    break;
                default:
                    this.banner = [];
                    this.body = {
                        goal: [],
                        judgement: [],
                        term: [],
                        meta: [],
                        sort: []
                    };
                    this.error = null;
                    this.plainText = content.body;
            }
        },
        enumerable: true,
        configurable: true
    });
    PanelBody = __decorate([
        vue_class_component_1.default({
            props: {
                "raw-content": Object
            },
            template: "\n        <div class=\"native-key-bindings\" tabindex=\"-1\"  v-show=\"!queryMode\">\n            <ul id=\"panel-content-banner\" class=\"list-group\">\n                <li class=\"list-item\" v-for=\"item in banner\">\n                    <span class=\"text-info\">{{item.label}}</span>\n                    <span>:</span>\n                    <type :input=\"item.type\"></type>\n                </li>\n            </ul>\n            <ul id=\"panel-content-body\" class=\"list-group\">\n                <li class=\"list-item\" v-for=\"item in body.goal\">\n                    <button class=\"no-btn text-info\" @click=\"jumpToGoal(item.index)\">{{item.index}}</button>\n                    <span>:</span>\n                    <type :input=\"item.type\"></type>\n                </li>\n                <li class=\"list-item\" v-for=\"item in body.judgement\">\n                    <span class=\"text-success\">{{item.expr}}</span>\n                    <span>:</span>\n                    <type :input=\"item.type\"></type>\n                </li>\n                <li class=\"list-item\" v-for=\"item in body.term\">\n                    <type :input=\"item.expr\"></type>\n                </li>\n                <li class=\"list-item\" v-for=\"item in body.meta\">\n                    <span class=\"text-success\">{{item.index}}</span>\n                    <span>:</span>\n                    <type :input=\"item.type\"></type>\n                    <location :location=\"item.location\"></location>\n                </li>\n                <li class=\"list-item\" v-for=\"item in body.sort\">\n                    <span class=\"text-highlight\">Sort</span> <span class=\"text-warning\">{{item.index}}</span>\n                    <location :location=\"item.location\"></location>\n                </li>\n            </ul>\n            <ul id=\"panel-content-error\" class=\"list-group\">\n                <error v-if=\"error\" :error=\"error\"></error>\n            </ul>\n            <ul id=\"panel-content-plain-text\" class=\"list-group\">\n                <li class=\"list-item\" v-for=\"item in plainText\">\n                    <span>{{item}}</span>\n                </li>\n            </ul>\n        </div>\n        "
        }), 
        __metadata('design:paramtypes', [])
    ], PanelBody);
    return PanelBody;
}(Vue));
Vue.component("agda-panel-body", PanelBody);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PanelBody;
//# sourceMappingURL=panel-body.js.map