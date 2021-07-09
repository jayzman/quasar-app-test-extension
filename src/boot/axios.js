import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import prompts from "src/prompts"

const axiosInstance = axios.create({
  baseURL: prompts.baseUrl,
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});

export { axiosInstance }
