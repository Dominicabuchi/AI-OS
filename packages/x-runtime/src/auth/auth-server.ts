import http from "http";

export class AuthServer {

  waitForCallback(): Promise<string> {

    return new Promise(resolve => {

      const server =
        http.createServer((req,res)=>{

          const url =
            new URL(
              req.url!,
              "http://localhost:3000"
            );

          const code =
            url.searchParams.get("code");

          res.end(
            "Authentication complete. You may close this window."
          );

          server.close();

          resolve(code ?? "");

        });

      server.listen(3000);

    });

  }

}
