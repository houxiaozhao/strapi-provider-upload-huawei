const mime = require("mime-types");
const ObsClient = require('esdk-obs-nodejs');


module.exports = {
    init(providerOptions) {
        const { endPoint, accessKey, secretKey, bucket, folder, acl, private = false, expiry = 7 * 24 * 60 * 60 } = providerOptions;

        const obsClient = new ObsClient({
            access_key_id: accessKey,
            secret_access_key: secretKey,
            server: 'https://' + endPoint
        });
        const getUploadPath = (file) => {
            const pathChunk = file.path ? `${file.path}/` : '';
            const path = folder ? `${folder}/${pathChunk}` : pathChunk;

            return `${path}${file.hash}${file.ext}`;
        };
        const getFilePath = (file) => {
            const path = file.url.replace(`https://${bucket}.${endPoint}/`, '');

            return path;
        };
        return {
            uploadStream(file) {
                return this.upload(file);
            },
            upload(file) {
                return new Promise((resolve, reject) => {
                    const path = getUploadPath(file);
                    obsClient.putObject({
                        Bucket: bucket,
                        Key: path,
                        Body: file.stream || Buffer.from(file.buffer, 'binary'),
                        ContentType: mime.lookup(file.ext) || 'application/octet-stream',
                        ACL: acl
                    }, (err, result) => {
                        if (err) {
                            console.error('Error-->' + err);
                            return reject(err);

                        } else {
                            console.log('Status-->' + result.CommonMsg.Status);
                            // https://construction-management-system.obs.cn-north-4.myhuaweicloud.com/cms/2023/09/13/org_3b94cb0c2c08714a_1683254070000_9c7f710029.jpg
                            file.url = `https://${bucket}.${endPoint}/${path}`;
                            resolve();
                        }
                    });
                });
            },
            delete(file) {
                return new Promise((resolve, reject) => {
                    const path = getFilePath(file);
                    obsClient.deleteObject({
                        Bucket: bucket,
                        Key: path
                    }, (err, result) => {
                        if (err) {
                            console.log('Error-->' + err);
                            return reject(err);
                        } else {
                            console.log('Status-->' + result.CommonMsg.Status);
                            resolve();
                        }
                    });

                });
            },
            isPrivate: () => {
                return (private === 'true' || private === true);
            },
            getSignedUrl(file) {
                console.log('file', file);
                return new Promise((resolve, reject) => {
                    const url = new URL(file.url);
                    if (url.hostname !== endPoint) {
                        resolve({ url: file.url });
                    } else if (!url.pathname.startsWith(`/${bucket}/`)) {
                        resolve({ url: file.url });
                    } else {
                        const path = getFilePath(file)
                        //TODO: 添加签名后设置图片处理的请求参数
                        // let res = obsClient.createSignedUrlSync({ Method: 'GET', Bucket: bucket, Key: path, Expires: +expiry, QueryParams: { 'x-image-process': 'style/small' } });
                        let res = obsClient.createSignedUrlSync({ Method: 'GET', Bucket: bucket, Key: path, Expires: +expiry });
                        resolve({ url: res.SignedUrl });
                    }
                });
            },
        };
    },
};
