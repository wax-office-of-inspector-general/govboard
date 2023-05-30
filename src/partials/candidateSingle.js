/** @jsx jsx */

import React from "react";
import { withRouter, Redirect } from "react-router-dom";
import * as waxjs from "@waxio/waxjs/dist";
import { withUAL } from "ual-reactjs-renderer";
import { jsx } from "@emotion/react";

import * as GLOBAL_STYLE from "../theme";

import twitter from "../assets/twitter.svg";
import telegram from "../assets/telegram.svg";
import wechat from "../assets/wechat.svg";
import { submitVote } from "../middleware.js";

const wax = new waxjs.WaxJS({
    rpcEndpoint: process.env.REACT_APP_WAX_RPC
});

class CandidateSingle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nominee: "",
            picture: "",
            description: "",
            telegram: "",
            twitter: "",
            wechat: "",
            votes: "0 VOTE",
            ballot: "",
            redirect: 0,
            refresh: 1,
        };
        this.VoteCandidate = this.VoteCandidate.bind(this);
    }

    componentDidMount = async () => {
        const owner = this.props.match.params.owner;
        //for some reason these props arent preserved on direct link to candidate
        let ballot = "";
        if (!this.props.ballot) {
            let resp = await wax.rpc.get_table_rows({
                limit: 1,
                code: "oig",
                scope: "oig",
                table: "election",
                json: true,
            });
            ballot = resp.rows[0].ballot;
        } else {
            ballot = this.props.ballot;
        }
        this.setState({
            ballot: ballot,
        });
        this.fetchData(owner);
    };

    async fetchData(owner) {
        let ownerCheck = owner.substring(0, 12);
        try {
            let resp = await wax.rpc.get_table_rows({
                code: "oig",
                scope: "oig",
                table: "nominees",
                limit: 1,
                lower_bound: ownerCheck,
                upper_bound: ownerCheck,
                json: true,
            });

            let voteCounts = await wax.rpc.get_table_rows({
                code: "decide",
                scope: "decide",
                table: "ballots",
                limit: 1,
                lower_bound: this.state.ballot,
                upper_bound: this.state.ballot,
                json: true,
            });
            if (Array.isArray(resp.rows) && resp.rows.length === 0) {
                this.setState({
                    redirect: 1,
                });
                
            }
            let voteCount = "0 VOTE";
            if (
                resp.rows.length !== 0 &&
                this.props.electionState === 4 &&
                Array.isArray(voteCounts.rows) &&
                voteCounts.rows.length !== 0
            ) {
                voteCount = voteCounts.rows[0].options.find((obj) => obj.key === resp.rows[0].owner).value;
            }
            let refresh = this.state.refresh;
            if (refresh === 1) {
                refresh = 0;
            }
            this.setState({
                nominee: resp.rows[0].owner,
                name: resp.rows[0].name,
                picture: resp.rows[0].picture,
                description: resp.rows[0].descriptor,
                telegram: resp.rows[0].telegram,
                twitter: resp.rows[0].twitter,
                wechat: resp.rows[0].wechat,
                votes: voteCount,
                refresh: refresh,
            });
        } catch (e) {
            console.log(e);
        }
    }

    async VoteCandidate() {
        await submitVote(this.props.activeUser, this.state.ballot, this.state.nominee);
        this.setState({
            refresh: 1,
        });
    }

    componentDidUpdate() {
        const owner = this.props.match.params.owner;
        if (this.state.refresh === 1) {
            return this.fetchData(owner);
        }
    }

    render() {
        if (this.state.redirect === 1) {
            return <Redirect to="/404" />;
        }
        return (
            <GLOBAL_STYLE.PageContent
                css={{
                    "& .image": {
                        maxWidth: 400,
                        marginBottom: GLOBAL_STYLE.spacing.s,
                    },
                    "& .socialIcons": {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        [GLOBAL_STYLE.mediaQuery.largeMobileUp]: {
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                        },
                    },
                    "& .socialMediaIcon": {
                        width: 44,
                        objecFit: "contain",
                        marginRight: GLOBAL_STYLE.spacing.xs,
                        marginBottom: GLOBAL_STYLE.spacing.xs,
                        "&:last-of-type": {
                            marginRight: 0,
                        },
                    },
                }}
            >
                <GLOBAL_STYLE.H2>{this.state.name}</GLOBAL_STYLE.H2>
                <GLOBAL_STYLE.H4>{this.state.votes}</GLOBAL_STYLE.H4>
                <img className="image" src={this.state.picture} alt={this.state.nominee} />
                {this.props.electionState === 4 && this.props.activeUser ? (
                    <React.Fragment>
                        <GLOBAL_STYLE.Button onClick={this.VoteCandidate} className="btn">
                            Vote for {this.state.name}
                        </GLOBAL_STYLE.Button>
                    </React.Fragment>
                ) : (
                    <React.Fragment></React.Fragment>
                )}
                <div className="candidateInformation">
                    <GLOBAL_STYLE.P className="description" css={{
                        whiteSpace: 'pre-line',
                        paddingTop: '20px',
                        paddingBottom: '20px'
                    }}>{this.state.description}</GLOBAL_STYLE.P>
                    {this.state.twitter || this.state.telegram || this.state.wechat ? (
                        <React.Fragment>
                            <GLOBAL_STYLE.H3>Social Media</GLOBAL_STYLE.H3>
                        </React.Fragment>
                    ) : (
                        <React.Fragment></React.Fragment>
                    )}
                    <div className="socialIcons">
                        {true || this.state.telegram ? (
                            <React.Fragment>
                                <a
                                    href={"https://t.me/" + this.state.telegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="telegram"
                                >
                                    <img
                                        className="socialMediaIcon"
                                        src={telegram}
                                        alt="Candidate's Telegram profile"
                                    />
                                </a>
                            </React.Fragment>
                        ) : (
                            <React.Fragment></React.Fragment>
                        )}
                        {true || this.state.twitter ? (
                            <React.Fragment>
                                <a
                                    href={"https://twitter.com/" + this.state.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="twitter"
                                >
                                    <img className="socialMediaIcon" src={twitter} alt="Candidate's Twitter profile" />
                                </a>
                            </React.Fragment>
                        ) : (
                            <React.Fragment></React.Fragment>
                        )}
                        {true || this.state.wechat ? (
                            <React.Fragment>
                                <a
                                    href={"weixin://dl/profile/" + this.state.wechat}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="wechat"
                                >
                                    <img className="socialMediaIcon" src={wechat} alt="Candidate's WeChat profile" />
                                </a>
                            </React.Fragment>
                        ) : (
                            <React.Fragment></React.Fragment>
                        )}
                    </div>
                </div>
            </GLOBAL_STYLE.PageContent>
        );
    }
}

export default withUAL(withRouter(CandidateSingle));
