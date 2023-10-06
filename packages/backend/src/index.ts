import { interpret } from "xstate";
import { machine } from "./machine.js";

interpret(machine).start();
