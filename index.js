const axios = require('axios')
const path = require('path')
const fs = require('fs')
const sequence = require('@lvchengbin/sequence')

const AUTHOR_ID = '982087'
const SUCCESS = 'SUCCESS'
let total = 0
let index = 0

async function get24ImgUrl(authorId, pageNumber, pageSize) {
    return axios.get(`https://a1t24.tuchong.com/rest/2/sites/${authorId}/posts?count=${pageSize}&page=${pageNumber}&before_timestamp=0`).then(res => res.data)
}

async function start() {
    const urlData = await get24ImgUrl(AUTHOR_ID, 1, 1000000)
    if (urlData.result !== SUCCESS) return
    console.log('total：' + urlData.counts)
    let formatData = urlData.post_list.map(item => {
        return {
            group: item.title,
            group_id: item.post_id,
            children: item.images.map(img => img.img_id)
        }
    })
    let steps = []
    formatData.forEach(item => {
        item.children.forEach(child => {
            steps.push(() => saveImg(`https://tuchong.pstatp.com/${AUTHOR_ID}/f/${child}.jpg`, './file', `${child}.jpg`))
        })
    })
    await sequence.chain(steps)
}

async function saveImg(url, filePath, fileName) {
    if (!fs.existsSync(path.resolve(__dirname, filePath))) {
        fs.mkdirSync(path.resolve(__dirname, filePath))
    }
    const imgPath = path.resolve(filePath, fileName)
    const data = await axios({
        method: 'get',
        url,
        responseType: 'stream'
    }).then(res => res.data)
    data.pipe(fs.createWriteStream(imgPath))
    console.log(total + '/' + index++, fileName)
}

start().then(res => {console.log('success')}).catch(err => {console.error(err)})
